using Npgsql;
using NextageClass.Api.Infrastructure;
using System.Text.Json.Serialization;

namespace NextageClass.Api.Students;

public sealed record StudentInput(string Name, string Level, [property: JsonRequired] DateOnly StartDate, string? Phone = null, string? Occupation = null, string? Interests = null, string? MeetingUrl = null)
{
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
        return this with { Name = name, Phone = phone, Occupation = occupation, Interests = interests, MeetingUrl = meetingUrl };
    }
}

public sealed record StudentData(string Id, string Name, string Level, DateOnly StartDate, string Phone, string Occupation, string Interests, string MeetingUrl, DateTime CreatedAt);

public sealed class StudentStore(NpgsqlDataSource source)
{
    public async Task<List<StudentData>> ListAsync(CancellationToken cancellationToken)
    {
        await using var command = source.CreateCommand("SELECT id, name, level, start_date, phone, occupation, interests, meeting_url, created_at FROM app.students ORDER BY name, id");
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var students = new List<StudentData>();
        while (await reader.ReadAsync(cancellationToken))
            students.Add(new StudentData(reader.GetString(0), reader.GetString(1), reader.GetString(2), reader.GetFieldValue<DateOnly>(3),
                reader.GetString(4), reader.GetString(5), reader.GetString(6), reader.GetString(7), reader.GetDateTime(8)));
        return students;
    }

    public async Task<StudentData> CreateAsync(StudentInput input, CancellationToken cancellationToken)
    {
        var values = input.Validated();
        var student = new StudentData(Guid.NewGuid().ToString(), values.Name, values.Level, values.StartDate,
            values.Phone!, values.Occupation!, values.Interests!, values.MeetingUrl!, DateTime.UtcNow);
        await using var command = source.CreateCommand("INSERT INTO app.students(id, name, level, start_date, phone, occupation, interests, meeting_url, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)");
        foreach (var value in new object[] { student.Id, student.Name, student.Level, student.StartDate, student.Phone, student.Occupation, student.Interests, student.MeetingUrl, student.CreatedAt })
            command.Parameters.AddWithValue(value);
        await command.ExecuteNonQueryAsync(cancellationToken);
        return student;
    }
}
