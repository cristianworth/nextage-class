using Npgsql;
using NpgsqlTypes;
using NextageClass.Api.Infrastructure;
using System.Text.Json.Serialization;

namespace NextageClass.Api.Students;

public sealed record StudentInput(string Name, string Level, [property: JsonRequired] DateOnly StartDate, string? Phone = null, string? Occupation = null, string? Interests = null, string? MeetingUrl = null)
{
    private string? primaryBookId;
    // Omission preserves the current link; explicit null removes it.
    public string? PrimaryBookId
    {
        get => primaryBookId;
        init { primaryBookId = value; IncludesPrimaryBookId = true; }
    }
    [JsonIgnore]
    public bool IncludesPrimaryBookId { get; private init; }

    public StudentInput Validated()
    {
        var name = (Name ?? "").Trim();
        if (name.Length is < 1 or > 100) throw new ApiFailure(400, "Informe um nome com até 100 caracteres.");
        if (!new[] { "A1", "A2", "B1", "B2", "C1", "C2" }.Contains(Level)) throw new ApiFailure(400, "Selecione um nível válido.");
        var phone = (Phone ?? "").Trim();
        var occupation = (Occupation ?? "").Trim();
        var interests = (Interests ?? "").Trim();
        var meetingUrl = (MeetingUrl ?? "").Trim();
        if (phone.Length > 50 || occupation.Length > 150 || interests.Length > 1000 || meetingUrl.Length > 2000)
            throw new ApiFailure(400, "Confira o tamanho dos dados complementares.");
        if (meetingUrl.Length > 0 && (!Uri.TryCreate(meetingUrl, UriKind.Absolute, out var url) ||
            (url.Scheme != "https" && url.Scheme != "http") || !string.IsNullOrEmpty(url.UserInfo)))
            throw new ApiFailure(400, "Informe um link HTTP ou HTTPS sem usuário ou senha.");
        if (PrimaryBookId is not null && (string.IsNullOrWhiteSpace(PrimaryBookId) || PrimaryBookId.Length > 100))
            throw new ApiFailure(400, "Selecione uma sequência principal válida ou nenhuma.");
        return this with { Name = name, Phone = phone, Occupation = occupation, Interests = interests, MeetingUrl = meetingUrl };
    }
}

public sealed record StudentData(string Id, string Name, string Level, DateOnly StartDate, string Phone, string Occupation, string Interests, string MeetingUrl, DateTime CreatedAt, string? PrimaryBookId = null);

public sealed class StudentStore(NpgsqlDataSource source)
{
    public async Task<List<StudentData>> ListAsync(CancellationToken cancellationToken)
    {
        await using var command = source.CreateCommand("SELECT id, name, level, start_date, phone, occupation, interests, meeting_url, created_at, primary_book_id FROM app.students ORDER BY name, id");
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var students = new List<StudentData>();
        while (await reader.ReadAsync(cancellationToken))
            students.Add(ReadStudent(reader));
        return students;
    }

    public async Task<StudentData> CreateAsync(StudentInput input, CancellationToken cancellationToken)
    {
        var values = input.Validated();
        await using var connection = await source.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
        await ValidatePrimaryBookAsync(connection, transaction, values.PrimaryBookId, null, values.Level, cancellationToken);
        var student = new StudentData(Guid.NewGuid().ToString(), values.Name, values.Level, values.StartDate,
            values.Phone!, values.Occupation!, values.Interests!, values.MeetingUrl!, DateTime.UtcNow, values.PrimaryBookId);
        await using var command = new NpgsqlCommand("INSERT INTO app.students(id, name, level, start_date, phone, occupation, interests, meeting_url, created_at, primary_book_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING created_at", connection, transaction);
        foreach (var value in new object[] { student.Id, student.Name, student.Level, student.StartDate, student.Phone, student.Occupation, student.Interests, student.MeetingUrl, student.CreatedAt })
            command.Parameters.AddWithValue(value);
        command.Parameters.AddWithValue(NpgsqlDbType.Text, (object?)student.PrimaryBookId ?? DBNull.Value);
        var persistedCreation = (DateTime)(await command.ExecuteScalarAsync(cancellationToken))!;
        await transaction.CommitAsync(cancellationToken);
        return student with { CreatedAt = persistedCreation };
    }

    public async Task<StudentData> UpdateAsync(string id, StudentInput input, CancellationToken cancellationToken)
    {
        var values = input.Validated();
        await using var connection = await source.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
        string? previousBook;
        await using (var previous = new NpgsqlCommand("SELECT primary_book_id FROM app.students WHERE id=$1 FOR UPDATE", connection, transaction))
        {
            previous.Parameters.AddWithValue(id);
            var stored = await previous.ExecuteScalarAsync(cancellationToken);
            if (stored is null) throw new ApiFailure(404, "Aluno não encontrado.");
            previousBook = stored as string;
        }
        var selectedBook = values.IncludesPrimaryBookId ? values.PrimaryBookId : previousBook;
        await ValidatePrimaryBookAsync(connection, transaction, selectedBook, previousBook, values.Level, cancellationToken);
        StudentData student;
        await using (var command = new NpgsqlCommand("UPDATE app.students SET name=$2, level=$3, start_date=$4, phone=$5, occupation=$6, interests=$7, meeting_url=$8, primary_book_id=$9 WHERE id=$1 RETURNING id, name, level, start_date, phone, occupation, interests, meeting_url, created_at, primary_book_id", connection, transaction))
        {
            foreach (var value in new object[] { id, values.Name, values.Level, values.StartDate, values.Phone!, values.Occupation!, values.Interests!, values.MeetingUrl! })
                command.Parameters.AddWithValue(value);
            command.Parameters.AddWithValue(NpgsqlDbType.Text, (object?)selectedBook ?? DBNull.Value);
            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            if (!await reader.ReadAsync(cancellationToken)) throw new ApiFailure(404, "Aluno não encontrado.");
            student = ReadStudent(reader);
        }
        // Keep the account label consistent without changing its identity or permissions.
        await using (var profile = new NpgsqlCommand("UPDATE app.access_profiles SET display_name=$2 WHERE student_id=$1 AND role='student'", connection, transaction))
        {
            profile.Parameters.AddWithValue(id);
            profile.Parameters.AddWithValue(student.Name);
            await profile.ExecuteNonQueryAsync(cancellationToken);
        }
        await transaction.CommitAsync(cancellationToken);
        return student;
    }

    private static StudentData ReadStudent(NpgsqlDataReader reader) => new(reader.GetString(0), reader.GetString(1), reader.GetString(2), reader.GetFieldValue<DateOnly>(3),
        reader.GetString(4), reader.GetString(5), reader.GetString(6), reader.GetString(7), reader.GetDateTime(8), reader.IsDBNull(9) ? null : reader.GetString(9));

    private static async Task ValidatePrimaryBookAsync(NpgsqlConnection connection, NpgsqlTransaction transaction, string? selected, string? previous, string level, CancellationToken cancellationToken)
    {
        if (selected is null) return;
        await using var command = new NpgsqlCommand("SELECT levels FROM app.books WHERE id=$1 FOR SHARE", connection, transaction);
        command.Parameters.AddWithValue(selected);
        var levels = await command.ExecuteScalarAsync(cancellationToken) as string[];
        if (levels is null) throw new ApiFailure(400, "A sequência principal não foi encontrada.");
        if (selected != previous && !levels.Contains(level))
            throw new ApiFailure(400, "Escolha uma sequência principal compatível com o nível do aluno.");
    }
}
