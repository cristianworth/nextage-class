using System.Text.Json;
using NextageClass.Api.Infrastructure;
using Npgsql;
using NpgsqlTypes;

namespace NextageClass.Api.Scheduling;

public sealed record LessonRecordInput(string LessonId, string Attendance, string? Content, string? Reason, JsonElement UsedMaterialId, JsonElement Homework);
public sealed record HomeworkData(string Description, DateTime? CorrectedAt);
public sealed record HomeworkCorrectionInput(string RecordId, bool Corrected, string ExpectedDescription);
public sealed record LessonRecordData(string Id, string LessonId, string StudentName, string Level, string Attendance,
    string Content, string Reason, JsonElement? MaterialSnapshot, DateTime CreatedAt, DateTime UpdatedAt, ScheduleLesson Lesson, HomeworkData? Homework = null);

public sealed class LessonRecordStore(NpgsqlDataSource source, TimeProvider clock)
{
    private static readonly TimeZoneInfo ReferenceZone = TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo");

    public async Task<List<LessonRecordData>> ReadAsync(CancellationToken cancellationToken)
    {
        await using var connection = await source.OpenConnectionAsync(cancellationToken);
        return await ReadAsync(connection, null, cancellationToken);
    }

    public async Task<List<LessonRecordData>> SaveAsync(LessonRecordInput input, CancellationToken cancellationToken)
    {
        if (input.Attendance is not ("attended" or "student-absent" or "teacher-absent"))
            throw new ApiFailure(400, "Selecione um resultado válido para a aula.");
        var content = (input.Content ?? "").Trim();
        var reason = input.Attendance == "attended" ? "" : (input.Reason ?? "").Trim();
        if (content.Length > 10000 || reason.Length > 1000 || (input.Attendance == "attended" && content.Length == 0))
            throw new ApiFailure(400, "Confira o conteúdo e o motivo informados.");
        if (input.UsedMaterialId.ValueKind is not (JsonValueKind.Undefined or JsonValueKind.Null or JsonValueKind.String))
            throw new ApiFailure(400, "Selecione um material válido.");
        if (input.Homework.ValueKind is not (JsonValueKind.Undefined or JsonValueKind.String))
            throw new ApiFailure(400, "Informe uma descrição válida de homework.");
        var submittedHomework = input.Homework.ValueKind == JsonValueKind.String ? input.Homework.GetString()!.Trim() : null;
        if (submittedHomework?.Length > 2000) throw new ApiFailure(400, "Use até 2.000 caracteres no homework.");

        await using var connection = await source.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
        await using (var scheduleLock = new NpgsqlCommand("SELECT pg_advisory_xact_lock(hashtextextended('nextage-class:teacher-schedule', 0))", connection, transaction))
            await scheduleLock.ExecuteNonQueryAsync(cancellationToken);
        var schedule = await ScheduleStore.LoadAsync(connection, transaction, cancellationToken);
        var lesson = ScheduleRules.FindLesson(schedule, input.LessonId) ?? throw new ApiFailure(404, "Esta aula não foi encontrada.");
        var local = TimeZoneInfo.ConvertTime(clock.GetUtcNow(), ReferenceZone);
        if (lesson.Date > DateOnly.FromDateTime(local.DateTime) ||
            (lesson.Date == DateOnly.FromDateTime(local.DateTime) && local.TimeOfDay < new TimeSpan(lesson.Hour, 55, 0)))
            throw new ApiFailure(400, "Você pode lançar a aula somente após seu término, no horário de Brasília.");
        var student = schedule.Students.Single(item => item.Id == lesson.StudentId);
        var previous = (await ReadAsync(connection, transaction, cancellationToken)).Find(item => item.LessonId == lesson.Id);
        var level = previous?.Level ?? student.Level;
        var description = submittedHomework ?? previous?.Homework?.Description ?? "";
        var correctedAt = description == previous?.Homework?.Description ? previous.Homework.CorrectedAt : null;
        string? snapshot = previous?.MaterialSnapshot?.GetRawText();
        if (input.UsedMaterialId.ValueKind == JsonValueKind.Null) snapshot = null;
        else if (input.UsedMaterialId.ValueKind == JsonValueKind.String)
        {
            var materialId = input.UsedMaterialId.GetString();
            const string materialSql = """
                SELECT jsonb_strip_nulls(jsonb_build_object('id',m.id,'title',m.title,'content',m.content,
                    'level',$2,'levels',COALESCE(b.levels,m.levels),'bookId',m.book_id,'bookTitle',b.title,
                    'lessonNumber',m.lesson_number,'updatedAt',m.updated_at))::text
                FROM app.materials m LEFT JOIN app.books b ON b.id=m.book_id
                WHERE m.id=$1 AND $2=ANY(COALESCE(b.levels,m.levels))
                """;
            await using var material = new NpgsqlCommand(materialSql, connection, transaction);
            material.Parameters.AddWithValue(materialId ?? "");
            material.Parameters.AddWithValue(level);
            snapshot = await material.ExecuteScalarAsync(cancellationToken) as string
                ?? throw new ApiFailure(400, "Selecione um conteúdo compatível com o nível deste registro.");
        }
        if (!schedule.Lessons.Any(item => item.Id == lesson.Id))
        {
            await using var materialize = new NpgsqlCommand("INSERT INTO app.schedule_lessons(id, student_id, lesson_date, hour, created_at, series_id, occurrence_index, rescheduled_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)", connection, transaction);
            materialize.Parameters.AddWithValue(lesson.Id);
            materialize.Parameters.AddWithValue(lesson.StudentId);
            materialize.Parameters.AddWithValue(lesson.Date);
            materialize.Parameters.AddWithValue(lesson.Hour);
            materialize.Parameters.AddWithValue(lesson.CreatedAt);
            materialize.Parameters.AddWithValue(NpgsqlDbType.Text, (object?)lesson.SeriesId ?? DBNull.Value);
            materialize.Parameters.AddWithValue(NpgsqlDbType.Integer, (object?)lesson.OccurrenceIndex ?? DBNull.Value);
            materialize.Parameters.AddWithValue(NpgsqlDbType.TimestampTz, (object?)lesson.RescheduledAt ?? DBNull.Value);
            await materialize.ExecuteNonQueryAsync(cancellationToken);
        }
        var now = clock.GetUtcNow().UtcDateTime;
        await using (var save = new NpgsqlCommand("""
            INSERT INTO app.lesson_records(lesson_id,id,student_name,level,attendance,content,reason,material_snapshot,created_at,updated_at,homework_description,homework_corrected_at)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$9,$10,$11)
            ON CONFLICT (lesson_id) DO UPDATE SET attendance=EXCLUDED.attendance,content=EXCLUDED.content,
                reason=EXCLUDED.reason,material_snapshot=EXCLUDED.material_snapshot,updated_at=EXCLUDED.updated_at,
                homework_description=EXCLUDED.homework_description,homework_corrected_at=EXCLUDED.homework_corrected_at
            """, connection, transaction))
        {
            save.Parameters.AddWithValue(lesson.Id);
            save.Parameters.AddWithValue(previous?.Id ?? Guid.NewGuid().ToString());
            save.Parameters.AddWithValue(previous?.StudentName ?? student.Name);
            save.Parameters.AddWithValue(level);
            save.Parameters.AddWithValue(input.Attendance);
            save.Parameters.AddWithValue(content);
            save.Parameters.AddWithValue(reason);
            save.Parameters.AddWithValue(NpgsqlDbType.Jsonb, (object?)snapshot ?? DBNull.Value);
            save.Parameters.AddWithValue(now);
            save.Parameters.AddWithValue(description);
            save.Parameters.AddWithValue(NpgsqlDbType.TimestampTz, (object?)correctedAt ?? DBNull.Value);
            await save.ExecuteNonQueryAsync(cancellationToken);
        }
        var result = await ReadAsync(connection, transaction, cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return result;
    }

    public async Task<List<LessonRecordData>> CorrectHomeworkAsync(HomeworkCorrectionInput input, CancellationToken cancellationToken)
    {
        await using var connection = await source.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
        await using (var gate = new NpgsqlCommand("SELECT pg_advisory_xact_lock(hashtextextended('nextage-class:teacher-schedule', 0))", connection, transaction))
            await gate.ExecuteNonQueryAsync(cancellationToken);
        var previous = (await ReadAsync(connection, transaction, cancellationToken)).Find(item => item.Id == input.RecordId);
        if (previous?.Homework is null) throw new ApiFailure(404, "Este homework não foi encontrado.");
        if (previous.Homework.Description != input.ExpectedDescription) throw new ApiFailure(409, "O homework mudou em outra aba. Atualize antes de corrigir.");
        var now = clock.GetUtcNow().UtcDateTime;
        await using (var update = new NpgsqlCommand("UPDATE app.lesson_records SET homework_corrected_at=$2,updated_at=$3 WHERE id=$1", connection, transaction))
        {
            update.Parameters.AddWithValue(input.RecordId);
            update.Parameters.AddWithValue(NpgsqlDbType.TimestampTz, input.Corrected ? now : DBNull.Value);
            update.Parameters.AddWithValue(now);
            await update.ExecuteNonQueryAsync(cancellationToken);
        }
        var result = await ReadAsync(connection, transaction, cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return result;
    }

    private static async Task<List<LessonRecordData>> ReadAsync(NpgsqlConnection connection, NpgsqlTransaction? transaction, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT r.id,r.lesson_id,r.student_name,r.level,r.attendance,r.content,r.reason,r.material_snapshot::text,r.created_at,r.updated_at,
                l.student_id,l.lesson_date,l.hour,l.created_at,l.series_id,l.occurrence_index,l.rescheduled_at,r.homework_description,r.homework_corrected_at
            FROM app.lesson_records r JOIN app.schedule_lessons l ON l.id=r.lesson_id ORDER BY l.lesson_date DESC,l.hour DESC,r.id
            """;
        await using var command = new NpgsqlCommand(sql, connection, transaction);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var records = new List<LessonRecordData>();
        while (await reader.ReadAsync(cancellationToken))
        {
            var lesson = new ScheduleLesson(reader.GetString(1), reader.GetString(10), reader.GetFieldValue<DateOnly>(11), reader.GetInt32(12), reader.GetDateTime(13),
                reader.IsDBNull(14) ? null : reader.GetString(14), reader.IsDBNull(15) ? null : reader.GetInt32(15), reader.IsDBNull(16) ? null : reader.GetDateTime(16));
            JsonElement? snapshot = reader.IsDBNull(7) ? null : JsonSerializer.Deserialize<JsonElement>(reader.GetString(7));
            records.Add(new(reader.GetString(0), reader.GetString(1), reader.GetString(2), reader.GetString(3), reader.GetString(4),
                reader.GetString(5), reader.GetString(6), snapshot, reader.GetDateTime(8), reader.GetDateTime(9), lesson,
                reader.GetString(17).Length == 0 ? null : new HomeworkData(reader.GetString(17), reader.IsDBNull(18) ? null : reader.GetDateTime(18))));
        }
        return records;
    }
}
