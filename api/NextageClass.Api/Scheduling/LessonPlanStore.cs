using NextageClass.Api.Infrastructure;
using Npgsql;
using NpgsqlTypes;

namespace NextageClass.Api.Scheduling;

public sealed record LessonPlanInput(string LessonId, DateOnly ExpectedDate, int ExpectedHour, string? MaterialId, string? Notes);
public sealed record LessonPlanData(string LessonId, string? MaterialId, string Notes, DateTime UpdatedAt);

public sealed class LessonPlanStore(NpgsqlDataSource source, TimeProvider clock)
{
    public async Task<List<LessonPlanData>> ReadAsync(CancellationToken cancellationToken)
    {
        await using var connection = await source.OpenConnectionAsync(cancellationToken);
        return await ReadAsync(connection, null, cancellationToken);
    }

    public async Task<List<LessonPlanData>> SaveAsync(LessonPlanInput input, CancellationToken cancellationToken)
    {
        var notes = (input.Notes ?? "").Trim();
        if (notes.Length > 5000) throw new ApiFailure(400, "Use até 5.000 caracteres na preparação.");
        await using var connection = await source.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
        await using (var gate = new NpgsqlCommand("SELECT pg_advisory_xact_lock(hashtextextended('nextage-class:teacher-schedule', 0))", connection, transaction))
            await gate.ExecuteNonQueryAsync(cancellationToken);
        var schedule = await ScheduleStore.LoadAsync(connection, transaction, cancellationToken);
        var lesson = ScheduleRules.FindLesson(schedule, input.LessonId) ?? throw new ApiFailure(404, "Esta aula não foi encontrada.");
        if (lesson.Date != input.ExpectedDate || lesson.Hour != input.ExpectedHour)
            throw new ApiFailure(409, "Esta aula mudou em outra aba. Atualize a agenda antes de preparar.");
        var local = TimeZoneInfo.ConvertTime(clock.GetUtcNow(), TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo"));
        if (lesson.Date < DateOnly.FromDateTime(local.DateTime) || (lesson.Date == DateOnly.FromDateTime(local.DateTime) && local.TimeOfDay >= new TimeSpan(lesson.Hour, 55, 0)))
            throw new ApiFailure(400, "A preparação pode ser alterada até o término da aula.");
        await using (var recorded = new NpgsqlCommand("SELECT EXISTS(SELECT 1 FROM app.lesson_records WHERE lesson_id=$1)", connection, transaction))
        {
            recorded.Parameters.AddWithValue(lesson.Id);
            if ((bool)(await recorded.ExecuteScalarAsync(cancellationToken))!) throw new ApiFailure(400, "Esta aula já possui registro.");
        }
        if (input.MaterialId is not null)
        {
            await using var material = new NpgsqlCommand("SELECT EXISTS(SELECT 1 FROM app.materials WHERE id=$1)", connection, transaction);
            material.Parameters.AddWithValue(input.MaterialId);
            if (!(bool)(await material.ExecuteScalarAsync(cancellationToken))!) throw new ApiFailure(400, "Selecione um material do acervo.");
        }
        if (!schedule.Lessons.Any(item => item.Id == lesson.Id) && (input.MaterialId is not null || notes.Length > 0))
        {
            await using var insert = new NpgsqlCommand("INSERT INTO app.schedule_lessons(id,student_id,lesson_date,hour,created_at,series_id,occurrence_index,rescheduled_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)", connection, transaction);
            insert.Parameters.AddWithValue(lesson.Id); insert.Parameters.AddWithValue(lesson.StudentId); insert.Parameters.AddWithValue(lesson.Date);
            insert.Parameters.AddWithValue(lesson.Hour); insert.Parameters.AddWithValue(lesson.CreatedAt);
            insert.Parameters.AddWithValue(NpgsqlDbType.Text, (object?)lesson.SeriesId ?? DBNull.Value);
            insert.Parameters.AddWithValue(NpgsqlDbType.Integer, (object?)lesson.OccurrenceIndex ?? DBNull.Value);
            insert.Parameters.AddWithValue(NpgsqlDbType.TimestampTz, (object?)lesson.RescheduledAt ?? DBNull.Value);
            await insert.ExecuteNonQueryAsync(cancellationToken);
        }
        await using (var save = new NpgsqlCommand(input.MaterialId is null && notes.Length == 0
            ? "DELETE FROM app.lesson_plans WHERE lesson_id=$1"
            : "INSERT INTO app.lesson_plans(lesson_id,material_id,notes,updated_at) VALUES ($1,$2,$3,$4) ON CONFLICT (lesson_id) DO UPDATE SET material_id=EXCLUDED.material_id,notes=EXCLUDED.notes,updated_at=EXCLUDED.updated_at", connection, transaction))
        {
            save.Parameters.AddWithValue(lesson.Id);
            if (input.MaterialId is not null || notes.Length > 0)
            {
                save.Parameters.AddWithValue(NpgsqlDbType.Text, (object?)input.MaterialId ?? DBNull.Value);
                save.Parameters.AddWithValue(notes);
                save.Parameters.AddWithValue(clock.GetUtcNow().UtcDateTime);
            }
            await save.ExecuteNonQueryAsync(cancellationToken);
        }
        var result = await ReadAsync(connection, transaction, cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return result;
    }

    private static async Task<List<LessonPlanData>> ReadAsync(NpgsqlConnection connection, NpgsqlTransaction? transaction, CancellationToken cancellationToken)
    {
        await using var command = new NpgsqlCommand("SELECT lesson_id,material_id,notes,updated_at FROM app.lesson_plans ORDER BY lesson_id", connection, transaction);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var result = new List<LessonPlanData>();
        while (await reader.ReadAsync(cancellationToken)) result.Add(new(reader.GetString(0), reader.IsDBNull(1) ? null : reader.GetString(1), reader.GetString(2), reader.GetDateTime(3)));
        return result;
    }
}
