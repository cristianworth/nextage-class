using System.Data;
using NextageClass.Api.Infrastructure;
using Npgsql;
using NpgsqlTypes;

namespace NextageClass.Api.Scheduling;

public sealed record TeacherRequestData(string Id, string StudentId, string StudentName, string Kind, DateOnly Date, int Hour, DateOnly? EndDate, string Status, DateTime CreatedAt, DateTime? DecidedAt, string? BookingId);
public sealed record RequestDecisionInput(string Decision);

public sealed class TeacherRequestStore(NpgsqlDataSource source, TimeProvider clock)
{
    public async Task<List<TeacherRequestData>> ListAsync(CancellationToken cancellationToken)
    {
        await using var command = source.CreateCommand("SELECT r.id,r.student_id,s.name,r.kind,r.lesson_date,r.hour,r.end_date,r.status,r.created_at,r.decided_at,r.booking_id FROM app.scheduling_requests r JOIN app.students s ON s.id=r.student_id ORDER BY r.created_at DESC,r.id DESC");
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var result = new List<TeacherRequestData>();
        while (await reader.ReadAsync(cancellationToken)) result.Add(Read(reader));
        return result;
    }

    public async Task<TeacherRequestData> DecideAsync(string id, string decision, CancellationToken cancellationToken)
    {
        if (decision is not ("approved" or "declined")) throw new ApiFailure(400, "Escolha aprovar ou recusar.");
        await using var connection = await source.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(IsolationLevel.ReadCommitted, cancellationToken);
        await using (var guard = new NpgsqlCommand("SELECT pg_advisory_xact_lock(hashtextextended('nextage-class:teacher-schedule', 0))", connection, transaction)) await guard.ExecuteNonQueryAsync(cancellationToken);
        TeacherRequestData request;
        await using (var command = new NpgsqlCommand("SELECT r.id,r.student_id,s.name,r.kind,r.lesson_date,r.hour,r.end_date,r.status,r.created_at,r.decided_at,r.booking_id FROM app.scheduling_requests r JOIN app.students s ON s.id=r.student_id WHERE r.id=$1 FOR UPDATE OF r", connection, transaction))
        {
            command.Parameters.AddWithValue(id);
            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            if (!await reader.ReadAsync(cancellationToken)) throw new ApiFailure(404, "Solicitação não encontrada.");
            request = Read(reader);
        }
        if (request.Status != "pending") throw new ApiFailure(409, "Esse pedido já foi decidido. A agenda não foi alterada.");
        var now = clock.GetUtcNow().UtcDateTime;
        now = now.AddTicks(-(now.Ticks % 10));
        string? bookingId = null;
        if (decision == "approved")
        {
            var local = TimeZoneInfo.ConvertTimeFromUtc(now, TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo"));
            var today = DateOnly.FromDateTime(local);
            if (request.Date < today || (request.Date == today && request.Hour <= local.Hour))
                throw new ApiFailure(409, "O primeiro horário já começou. Recuse este pedido e combine um novo início com o aluno.");
            var before = await ScheduleStore.LoadAsync(connection, transaction, cancellationToken);
            var after = ScheduleRules.AddLesson(before, new(request.StudentId, request.Date, request.Hour, request.Kind == "weekly", request.EndDate), now);
            ScheduleRules.CheckConflicts(after);
            bookingId = request.Kind == "weekly" ? after.Series[^1].Id : after.Lessons[^1].Id;
            await ScheduleStore.SaveChangesAsync(connection, transaction, before, after, cancellationToken);
        }
        await using (var update = new NpgsqlCommand("UPDATE app.scheduling_requests SET status=$2,decided_at=$3,booking_id=$4 WHERE id=$1", connection, transaction))
        {
            update.Parameters.AddWithValue(id); update.Parameters.AddWithValue(decision); update.Parameters.AddWithValue(now);
            update.Parameters.AddWithValue(NpgsqlDbType.Text, (object?)bookingId ?? DBNull.Value);
            await update.ExecuteNonQueryAsync(cancellationToken);
        }
        await transaction.CommitAsync(cancellationToken);
        return request with { Status = decision, DecidedAt = now, BookingId = bookingId };
    }

    private static TeacherRequestData Read(NpgsqlDataReader reader) => new(reader.GetString(0),reader.GetString(1),reader.GetString(2),reader.GetString(3),reader.GetFieldValue<DateOnly>(4),reader.GetInt32(5),reader.IsDBNull(6) ? null : reader.GetFieldValue<DateOnly>(6),reader.GetString(7),reader.GetDateTime(8),reader.IsDBNull(9) ? null : reader.GetDateTime(9),reader.IsDBNull(10) ? null : reader.GetString(10));
}