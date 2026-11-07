using System.Data;
using NextageClass.Api.Infrastructure;
using Npgsql;
using NpgsqlTypes;

namespace NextageClass.Api.Scheduling;

public sealed record StudentRequestInput(string Kind, DateOnly Date, int Hour, DateOnly? EndDate);
public sealed record StudentRequestData(string Id, string Kind, DateOnly Date, int Hour, DateOnly? EndDate, string Status, DateTime CreatedAt, DateTime? DecidedAt);

public sealed class StudentRequestStore(NpgsqlDataSource source, TimeProvider clock)
{
    public async Task<List<StudentRequestData>> ListAsync(string? studentId, CancellationToken cancellationToken)
    {
        var student = Student(studentId);
        await using var command = source.CreateCommand("SELECT id,kind,lesson_date,hour,end_date,status,created_at,decided_at FROM app.scheduling_requests WHERE student_id=$1 ORDER BY created_at DESC,id DESC");
        command.Parameters.AddWithValue(student);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var items = new List<StudentRequestData>();
        while (await reader.ReadAsync(cancellationToken)) items.Add(new(reader.GetString(0), reader.GetString(1), reader.GetFieldValue<DateOnly>(2), reader.GetInt32(3), reader.IsDBNull(4) ? null : reader.GetFieldValue<DateOnly>(4), reader.GetString(5), reader.GetDateTime(6), reader.IsDBNull(7) ? null : reader.GetDateTime(7)));
        return items;
    }

    public async Task<int[]> AvailableAsync(string? studentId, string kind, DateOnly date, DateOnly? endDate, CancellationToken cancellationToken)
    {
        var student = Student(studentId);
        ValidatePeriod(kind, date, endDate);
        await using var connection = await source.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(IsolationLevel.RepeatableRead, cancellationToken);
        var state = await ScheduleStore.LoadAsync(connection, transaction, cancellationToken);
        var available = Enumerable.Range(7, 16).Where(hour => IsAvailable(state, student, new(kind, date, hour, endDate))).ToArray();
        await transaction.CommitAsync(cancellationToken);
        return available;
    }

    public async Task<StudentRequestData> SubmitAsync(string? studentId, StudentRequestInput input, CancellationToken cancellationToken)
    {
        var student = Student(studentId);
        ValidatePeriod(input.Kind, input.Date, input.EndDate);
        if (input.Hour is < 7 or > 22) throw new ApiFailure(400, "Escolha um horário entre 07h e 22h.");
        await using var connection = await source.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(IsolationLevel.ReadCommitted, cancellationToken);
        await using (var guard = new NpgsqlCommand("SELECT pg_advisory_xact_lock(hashtextextended('nextage-class:teacher-schedule', 0))", connection, transaction)) await guard.ExecuteNonQueryAsync(cancellationToken);
        var state = await ScheduleStore.LoadAsync(connection, transaction, cancellationToken);
        if (!IsAvailable(state, student, input)) throw new ApiFailure(409, "Esse horário não está mais disponível para o período escolhido. Consulte outros horários.");
        var id = Guid.NewGuid().ToString();
        try
        {
            await using var insert = new NpgsqlCommand("INSERT INTO app.scheduling_requests(id,student_id,kind,lesson_date,hour,end_date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING created_at", connection, transaction);
            insert.Parameters.AddWithValue(id); insert.Parameters.AddWithValue(student); insert.Parameters.AddWithValue(input.Kind); insert.Parameters.AddWithValue(input.Date); insert.Parameters.AddWithValue(input.Hour);
            insert.Parameters.AddWithValue(NpgsqlDbType.Date, (object?)input.EndDate ?? DBNull.Value);
            var created = (DateTime)(await insert.ExecuteScalarAsync(cancellationToken))!;
            await transaction.CommitAsync(cancellationToken);
            return new(id, input.Kind, input.Date, input.Hour, input.EndDate, "pending", created, null);
        }
        catch (PostgresException error) when (error.SqlState == PostgresErrorCodes.UniqueViolation && error.ConstraintName == "scheduling_requests_pending_unique")
        { throw new ApiFailure(409, "Você já tem um pedido pendente para esse horário e período."); }
    }

    private bool IsAvailable(ScheduleData state, string studentId, StudentRequestInput input)
    {
        var local = TimeZoneInfo.ConvertTime(clock.GetUtcNow(), TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo"));
        var today = DateOnly.FromDateTime(local.DateTime);
        if (input.Date < today || (input.Date == today && input.Hour <= local.Hour)) return false;
        try
        {
            var candidate = ScheduleRules.AddLesson(state, new(studentId, input.Date, input.Hour, input.Kind == "weekly", input.EndDate), clock.GetUtcNow().UtcDateTime);
            ScheduleRules.CheckConflicts(candidate);
            return true;
        }
        catch (ApiFailure failure) when (failure.Status == 409) { return false; }
    }
    private static string Student(string? id) => !string.IsNullOrWhiteSpace(id) ? id : throw new ApiFailure(403, "Seu acesso não está vinculado a um aluno ativo.");
    private static void ValidatePeriod(string kind, DateOnly date, DateOnly? end)
    {
        if (kind is not ("once" or "weekly") || date.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday || (kind == "once" && end is not null) || end < date)
            throw new ApiFailure(400, "Escolha uma data e um período válidos de segunda a sexta.");
    }
}