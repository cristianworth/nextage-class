using System.Data;
using NextageClass.Api.Infrastructure;
using Npgsql;
using NpgsqlTypes;

namespace NextageClass.Api.Scheduling;

public sealed class ScheduleStore(NpgsqlDataSource source, TimeProvider clock)
{
    public async Task<ScheduleData> ReadAsync(CancellationToken cancellationToken)
    {
        await using var connection = await source.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(IsolationLevel.RepeatableRead, cancellationToken);
        var data = await LoadAsync(connection, transaction, cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return data;
    }

    public Task<ScheduleData> AddLessonAsync(ScheduleLessonInput input, CancellationToken cancellationToken) =>
        ChangeAsync((state, now) => ScheduleRules.AddLesson(state, input, now), cancellationToken);

    public Task<ScheduleData> AddBlockAsync(ScheduleBlockInput input, CancellationToken cancellationToken) =>
        ChangeAsync((state, now) => ScheduleRules.AddBlock(state, input, now), cancellationToken);

    public Task<ScheduleData> RemoveBlockAsync(string id, CancellationToken cancellationToken) =>
        ChangeAsync((state, _) => ScheduleRules.RemoveBlock(state, id), cancellationToken);

    public Task<ScheduleData> RescheduleAsync(RescheduleInput input, CancellationToken cancellationToken) =>
        ChangeAsync((state, now) => ScheduleRules.Reschedule(state, input, now), cancellationToken);

    private async Task<ScheduleData> ChangeAsync(Func<ScheduleData, DateTime, ScheduleData> change, CancellationToken cancellationToken)
    {
        await using var connection = await source.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(IsolationLevel.ReadCommitted, cancellationToken);
        // Take the lock before reading so a waiting command sees the previous commit.
        await using var lockCommand = new NpgsqlCommand("SELECT pg_advisory_xact_lock(hashtextextended('nextage-class:teacher-schedule', 0))", connection, transaction);
        await lockCommand.ExecuteNonQueryAsync(cancellationToken);
        var before = await LoadAsync(connection, transaction, cancellationToken);
        var now = clock.GetUtcNow().UtcDateTime;
        var after = change(before, now.AddTicks(-(now.Ticks % 10)));
        var remaining = after.Lessons.Select(item => item.Id).ToHashSet();
        await using (var planned = new NpgsqlCommand("SELECT lesson_id FROM app.lesson_plans", connection, transaction))
        await using (var reader = await planned.ExecuteReaderAsync(cancellationToken))
        {
            while (await reader.ReadAsync(cancellationToken))
            {
                var id = reader.GetString(0);
                if (remaining.Contains(id)) continue;
                var moved = ScheduleRules.FindLesson(after, id)
                    ?? throw new ApiFailure(400, "A alteração deixaria uma aula planejada fora do término da série. Nada foi alterado.");
                after.Lessons.Add(moved);
            }
        }
        ScheduleRules.CheckConflicts(after);
        await SaveChangesAsync(connection, transaction, before, after, cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return after;
    }

    internal static async Task<ScheduleData> LoadAsync(NpgsqlConnection connection, NpgsqlTransaction transaction, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT id, name, level, meeting_url, primary_book_id FROM app.students ORDER BY name, id;
            SELECT id, student_id, lesson_date, hour, created_at, series_id, occurrence_index, rescheduled_at FROM app.schedule_lessons ORDER BY lesson_date, hour, id;
            SELECT id, student_id, created_at, end_date FROM app.schedule_series ORDER BY id;
            SELECT series_id, from_index, lesson_date, hour FROM app.schedule_segments ORDER BY series_id, from_index;
            SELECT id, title, block_date, start_hour, end_hour, repeat, end_date, created_at FROM app.schedule_blocks ORDER BY block_date, start_hour, id;
            """;
        await using var query = new NpgsqlCommand(sql, connection, transaction);
        await using var reader = await query.ExecuteReaderAsync(cancellationToken);
        var students = new List<ScheduleStudent>();
        while (await reader.ReadAsync(cancellationToken))
            students.Add(new(reader.GetString(0), reader.GetString(1), reader.GetString(2), reader.GetString(3), reader.IsDBNull(4) ? null : reader.GetString(4)));
        await reader.NextResultAsync(cancellationToken);
        var lessons = new List<ScheduleLesson>();
        while (await reader.ReadAsync(cancellationToken))
            lessons.Add(new(reader.GetString(0), reader.GetString(1), reader.GetFieldValue<DateOnly>(2), reader.GetInt32(3), reader.GetDateTime(4),
                reader.IsDBNull(5) ? null : reader.GetString(5), reader.IsDBNull(6) ? null : reader.GetInt32(6), reader.IsDBNull(7) ? null : reader.GetDateTime(7)));
        await reader.NextResultAsync(cancellationToken);
        var series = new Dictionary<string, ScheduleSeries>();
        while (await reader.ReadAsync(cancellationToken))
            series.Add(reader.GetString(0), new(reader.GetString(0), reader.GetString(1), reader.GetDateTime(2), reader.IsDBNull(3) ? null : reader.GetFieldValue<DateOnly>(3), []));
        await reader.NextResultAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
            series[reader.GetString(0)].Segments.Add(new(reader.GetInt32(1), reader.GetFieldValue<DateOnly>(2), reader.GetInt32(3)));
        await reader.NextResultAsync(cancellationToken);
        var blocks = new List<ScheduleBlock>();
        while (await reader.ReadAsync(cancellationToken))
            blocks.Add(new(reader.GetString(0), reader.GetString(1), reader.GetFieldValue<DateOnly>(2), reader.GetInt32(3), reader.GetInt32(4), reader.GetString(5),
                reader.IsDBNull(6) ? null : reader.GetFieldValue<DateOnly>(6), reader.GetDateTime(7)));
        return new(students, lessons, [.. series.Values], blocks);
    }

    private static async Task SaveChangesAsync(NpgsqlConnection connection, NpgsqlTransaction transaction, ScheduleData before, ScheduleData after, CancellationToken cancellationToken)
    {
        await using var batch = new NpgsqlBatch(connection, transaction);
        var oldSeries = before.Series.ToDictionary(item => item.Id);
        foreach (var series in after.Series)
        {
            if (!oldSeries.TryGetValue(series.Id, out var previous))
                Add(batch, "INSERT INTO app.schedule_series(id, student_id, end_date, created_at) VALUES ($1,$2,$3,$4)", series.Id, series.StudentId, series.EndDate, series.CreatedAt);
            else if (previous == series) continue;
            else Add(batch, "DELETE FROM app.schedule_segments WHERE series_id=$1", series.Id);
            foreach (var segment in series.Segments)
                Add(batch, "INSERT INTO app.schedule_segments(series_id, from_index, lesson_date, hour) VALUES ($1,$2,$3,$4)", series.Id, segment.FromIndex, segment.Date, segment.Hour);
        }

        var oldLessons = before.Lessons.ToDictionary(item => item.Id);
        var newLessonIds = after.Lessons.Select(item => item.Id).ToHashSet();
        foreach (var id in oldLessons.Keys.Where(id => !newLessonIds.Contains(id)))
            Add(batch, "DELETE FROM app.schedule_lessons WHERE id=$1", id);
        foreach (var lesson in after.Lessons)
        {
            if (!oldLessons.TryGetValue(lesson.Id, out var previous))
                Add(batch, "INSERT INTO app.schedule_lessons(id, student_id, lesson_date, hour, created_at, series_id, occurrence_index, rescheduled_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
                    lesson.Id, lesson.StudentId, lesson.Date, lesson.Hour, lesson.CreatedAt, lesson.SeriesId, lesson.OccurrenceIndex, lesson.RescheduledAt);
            else if (lesson != previous)
                Add(batch, "UPDATE app.schedule_lessons SET lesson_date=$2, hour=$3, rescheduled_at=$4 WHERE id=$1", lesson.Id, lesson.Date, lesson.Hour, lesson.RescheduledAt);
        }

        var oldBlockIds = before.Blocks.Select(item => item.Id).ToHashSet();
        var newBlockIds = after.Blocks.Select(item => item.Id).ToHashSet();
        foreach (var id in oldBlockIds.Where(id => !newBlockIds.Contains(id)))
            Add(batch, "DELETE FROM app.schedule_blocks WHERE id=$1", id);
        foreach (var block in after.Blocks.Where(item => !oldBlockIds.Contains(item.Id)))
            Add(batch, "INSERT INTO app.schedule_blocks(id, title, block_date, start_hour, end_hour, repeat, end_date, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
                block.Id, block.Title, block.Date, block.StartHour, block.EndHour, block.Repeat, block.EndDate, block.CreatedAt);

        if (batch.BatchCommands.Count > 0) await batch.ExecuteNonQueryAsync(cancellationToken);
    }

    private static void Add(NpgsqlBatch batch, string sql, params object?[] values)
    {
        var command = new NpgsqlBatchCommand(sql);
        foreach (var value in values)
            command.Parameters.Add(value is null
                ? new NpgsqlParameter { NpgsqlDbType = NpgsqlDbType.Unknown, Value = DBNull.Value }
                : new NpgsqlParameter { Value = value });
        batch.BatchCommands.Add(command);
    }
}
