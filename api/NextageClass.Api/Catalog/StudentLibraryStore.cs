using System.Data;
using NextageClass.Api.Infrastructure;
using Npgsql;

namespace NextageClass.Api.Catalog;

public sealed record StudentLibrarySequence(string Id, string Title, string[] Levels);
public sealed record StudentLibraryMaterial(string Id, string Title, string Content, string[] Levels, string? SequenceId, string? SequenceTitle, int? LessonNumber, DateTime UpdatedAt);
public sealed record StudentLibraryPrimary(string Status, string? Id = null, string? Title = null, string? CurrentItemId = null);
public sealed record StudentLibraryData(string Level, List<StudentLibrarySequence> Sequences, List<StudentLibraryMaterial> Materials, StudentLibraryPrimary Primary);

public sealed class StudentLibraryStore(NpgsqlDataSource source)
{
    public async Task<StudentLibraryData> ReadAsync(string? studentId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(studentId)) throw new ApiFailure(403, "Seu acesso não está vinculado a um aluno ativo.");
        await using var connection = await source.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(IsolationLevel.RepeatableRead, cancellationToken);
        const string sql = """
            SELECT level,primary_book_id FROM app.students WHERE id=@student;
            SELECT b.id,b.title,b.levels FROM app.books b JOIN app.students s ON s.id=@student WHERE s.level=ANY(b.levels) ORDER BY b.title,b.id;
            SELECT m.id,m.title,m.content,COALESCE(b.levels,m.levels),m.book_id,b.title,m.lesson_number,m.updated_at
            FROM app.materials m LEFT JOIN app.books b ON b.id=m.book_id JOIN app.students s ON s.id=@student
            WHERE s.level=ANY(COALESCE(b.levels,m.levels)) ORDER BY m.book_id,m.lesson_number NULLS LAST,m.title,m.id;
            SELECT r.course_progress->'next'->>'id', (r.material_snapshot->>'lessonNumber')::int
            FROM app.lesson_records r JOIN app.schedule_lessons l ON l.id=r.lesson_id JOIN app.students s ON s.id=l.student_id
            WHERE s.id=@student AND r.attendance='attended' AND r.course_progress IS NOT NULL AND r.material_snapshot->>'bookId'=s.primary_book_id
            ORDER BY l.lesson_date DESC,l.hour DESC,r.id LIMIT 1;
            """;
        await using var command = new NpgsqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("student", studentId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken)) throw new ApiFailure(403, "Seu acesso não está vinculado a um aluno ativo.");
        var level = reader.GetString(0);
        var primaryId = reader.IsDBNull(1) ? null : reader.GetString(1);
        var sequences = new List<StudentLibrarySequence>();
        await reader.NextResultAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken)) sequences.Add(new(reader.GetString(0), reader.GetString(1), reader.GetFieldValue<string[]>(2)));
        var materials = new List<StudentLibraryMaterial>();
        await reader.NextResultAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken)) materials.Add(new(reader.GetString(0), reader.GetString(1), reader.GetString(2), reader.GetFieldValue<string[]>(3), reader.IsDBNull(4) ? null : reader.GetString(4), reader.IsDBNull(5) ? null : reader.GetString(5), reader.IsDBNull(6) ? null : reader.GetInt32(6), reader.GetDateTime(7)));
        await reader.NextResultAsync(cancellationToken);
        var hasProgress = await reader.ReadAsync(cancellationToken);
        var nextId = hasProgress && !reader.IsDBNull(0) ? reader.GetString(0) : null;
        var lastNumber = hasProgress && !reader.IsDBNull(1) ? reader.GetInt32(1) : (int?)null;
        await reader.DisposeAsync();
        await transaction.CommitAsync(cancellationToken);
        var sequence = sequences.Find(item => item.Id == primaryId);
        StudentLibraryPrimary primary;
        if (primaryId is null) primary = new("unassigned");
        else if (sequence is null) primary = new("unavailable");
        else
        {
            var units = materials.Where(item => item.SequenceId == primaryId && item.LessonNumber is not null).OrderBy(item => item.LessonNumber).ToList();
            var next = !hasProgress ? units.FirstOrDefault() : nextId is not null ? units.Find(item => item.Id == nextId) : units.FirstOrDefault(item => item.LessonNumber > lastNumber);
            primary = nextId is not null && next is null ? new("unavailable") : new(next is not null ? "current" : hasProgress ? "finished" : "empty", sequence.Id, sequence.Title, next?.Id);
        }
        return new(level, sequences, materials, primary);
    }
}