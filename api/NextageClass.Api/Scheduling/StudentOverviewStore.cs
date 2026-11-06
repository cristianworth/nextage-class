using System.Data;
using NextageClass.Api.Infrastructure;
using Npgsql;

namespace NextageClass.Api.Scheduling;

public sealed record StudentOverviewStudent(string Id, string Name, string Level);
public sealed record StudentOverviewLesson(string Id, DateOnly Date, int Hour);
public sealed record StudentOverviewMaterial(string Title, string? SequenceTitle, int? LessonNumber, string Content);
public sealed record StudentOverviewHomework(string Description, DateTime? CorrectedAt);
public sealed record StudentOverviewHistory(string Id, DateOnly Date, int Hour, string Attendance, string Level, string Material, StudentOverviewMaterial? MaterialSnapshot, StudentOverviewHomework? Homework);
public sealed record StudentPendingHomework(string Id, DateOnly Date, string Description);
public sealed record StudentOverviewData(StudentOverviewStudent Student, string MeetingUrl, List<StudentOverviewLesson> Upcoming, List<StudentOverviewHistory> History, List<StudentPendingHomework> PendingHomework);

public sealed class StudentOverviewStore(NpgsqlDataSource source, TimeProvider clock)
{
    public async Task<StudentOverviewData> ReadAsync(string? studentId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(studentId)) throw new ApiFailure(403, "Seu acesso não está vinculado a um aluno ativo.");
        await using var connection = await source.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(IsolationLevel.RepeatableRead, cancellationToken);
        const string sql = """
            SELECT id,name,level,meeting_url FROM app.students WHERE id=@student;
            SELECT id,student_id,lesson_date,hour,created_at,series_id,occurrence_index,rescheduled_at FROM app.schedule_lessons WHERE student_id=@student;
            SELECT id,student_id,created_at,end_date FROM app.schedule_series WHERE student_id=@student;
            SELECT s.series_id,s.from_index,s.lesson_date,s.hour FROM app.schedule_segments s JOIN app.schedule_series r ON r.id=s.series_id WHERE r.student_id=@student ORDER BY s.series_id,s.from_index;
            SELECT r.id,l.lesson_date,l.hour,r.attendance,r.level,
                   r.material_snapshot->>'title',r.material_snapshot->>'bookTitle',r.material_snapshot->>'lessonNumber',r.material_snapshot->>'content',
                   r.homework_description,r.homework_corrected_at
            FROM app.lesson_records r JOIN app.schedule_lessons l ON l.id=r.lesson_id
            WHERE l.student_id=@student ORDER BY l.lesson_date DESC,l.hour DESC,r.id;
            """;
        await using var command = new NpgsqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("student", studentId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken)) throw new ApiFailure(403, "Seu acesso não está vinculado a um aluno ativo.");
        var student = new StudentOverviewStudent(reader.GetString(0), reader.GetString(1), reader.GetString(2));
        var link = reader.GetString(3);
        var lessons = new List<ScheduleLesson>();
        await reader.NextResultAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken)) lessons.Add(new(reader.GetString(0), reader.GetString(1), reader.GetFieldValue<DateOnly>(2), reader.GetInt32(3), reader.GetDateTime(4), reader.IsDBNull(5) ? null : reader.GetString(5), reader.IsDBNull(6) ? null : reader.GetInt32(6), reader.IsDBNull(7) ? null : reader.GetDateTime(7)));
        var series = new Dictionary<string, ScheduleSeries>();
        await reader.NextResultAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken)) series.Add(reader.GetString(0), new(reader.GetString(0), reader.GetString(1), reader.GetDateTime(2), reader.IsDBNull(3) ? null : reader.GetFieldValue<DateOnly>(3), []));
        await reader.NextResultAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken)) series[reader.GetString(0)].Segments.Add(new(reader.GetInt32(1), reader.GetFieldValue<DateOnly>(2), reader.GetInt32(3)));
        var history = new List<StudentOverviewHistory>();
        await reader.NextResultAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            var material = reader.IsDBNull(5) ? null : new StudentOverviewMaterial(reader.GetString(5), reader.IsDBNull(6) ? null : reader.GetString(6), reader.IsDBNull(7) ? null : int.Parse(reader.GetString(7), System.Globalization.CultureInfo.InvariantCulture), reader.IsDBNull(8) ? "" : reader.GetString(8));
            var homework = reader.GetString(9).Length == 0 ? null : new StudentOverviewHomework(reader.GetString(9), reader.IsDBNull(10) ? null : reader.GetDateTime(10));
            history.Add(new(reader.GetString(0), reader.GetFieldValue<DateOnly>(1), reader.GetInt32(2), reader.GetString(3), reader.GetString(4), material?.Title ?? "", material, homework));
        }
        await reader.DisposeAsync();
        await transaction.CommitAsync(cancellationToken);
        var schedule = new ScheduleData([], lessons, [.. series.Values], []);
        var upcoming = ScheduleRules.UpcomingLessons(schedule, clock.GetUtcNow(), 6).Select(item => new StudentOverviewLesson(item.Id, item.Date, item.Hour)).ToList();
        var pending = history.Where(item => item.Homework is { CorrectedAt: null }).Select(item => new StudentPendingHomework(item.Id, item.Date, item.Homework!.Description)).ToList();
        return new(student, link, upcoming, history, pending);
    }
}
