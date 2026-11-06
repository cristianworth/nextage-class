using System.Globalization;
using NextageClass.Api.Infrastructure;

namespace NextageClass.Api.Scheduling;

internal static class ScheduleRules
{
    private static readonly TimeZoneInfo ReferenceZone = TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo");

    public static ScheduleData AddLesson(ScheduleData state, ScheduleLessonInput input, DateTime now)
    {
        ValidateSlot(input.Date, input.Hour);
        ValidateEnd(input.Date, input.Weekly, input.EndDate);
        if (!state.Students.Any(item => item.Id == input.StudentId))
            throw new ApiFailure(400, "Selecione um aluno cadastrado.");
        var id = Guid.NewGuid().ToString();
        return input.Weekly
            ? state with { Series = [.. state.Series, new ScheduleSeries(id, input.StudentId, now, input.EndDate, [new(0, input.Date, input.Hour)])] }
            : state with { Lessons = [.. state.Lessons, new ScheduleLesson(id, input.StudentId, input.Date, input.Hour, now)] };
    }

    public static ScheduleData AddBlock(ScheduleData state, ScheduleBlockInput input, DateTime now)
    {
        ValidateSlot(input.Date, input.StartHour);
        if (input.EndHour <= input.StartHour || input.EndHour > 23)
            throw new ApiFailure(400, "O fim do bloqueio deve ser depois do início e até as 23h.");
        if (input.Repeat is not ("once" or "weekly")) throw new ApiFailure(400, "Selecione uma repetição válida.");
        ValidateEnd(input.Date, input.Repeat == "weekly", input.EndDate);
        var title = (input.Title ?? "").Trim();
        if (title.Length > 100) throw new ApiFailure(400, "Use até 100 caracteres na descrição.");
        var block = new ScheduleBlock(Guid.NewGuid().ToString(), title.Length == 0 ? "Horário ocupado" : title,
            input.Date, input.StartHour, input.EndHour, input.Repeat, input.EndDate, now);
        return state with { Blocks = [.. state.Blocks, block] };
    }

    public static ScheduleData RemoveBlock(ScheduleData state, string id)
    {
        if (!state.Blocks.Any(item => item.Id == id)) throw new ApiFailure(404, "Este bloqueio não foi encontrado.");
        return state with { Blocks = state.Blocks.Where(item => item.Id != id).ToList() };
    }

    public static ScheduleData Reschedule(ScheduleData state, RescheduleInput input, DateTime now)
    {
        ValidateSlot(input.Date, input.Hour);
        if (input.Scope is not ("single" or "following")) throw new ApiFailure(400, "Selecione um alcance válido para a remarcação.");
        var lesson = FindLesson(state, input.LessonId) ?? throw new ApiFailure(404, "Esta aula não foi encontrada.");
        if (lesson.Date != input.ExpectedDate || lesson.Hour != input.ExpectedHour)
            throw new ApiFailure(409, "Esta aula mudou em outra aba. Atualize a agenda antes de remarcar.");
        var local = TimeZoneInfo.ConvertTimeFromUtc(now, ReferenceZone);
        var today = DateOnly.FromDateTime(local);
        bool Started(DateOnly date, int hour) => date < today || (date == today && hour <= local.Hour);
        if (Started(lesson.Date, lesson.Hour)) throw new ApiFailure(400, "Aulas iniciadas mantêm seu horário para preservar o histórico.");
        if (Started(input.Date, input.Hour)) throw new ApiFailure(400, "Escolha um novo horário que ainda não começou.");

        if (input.Scope == "single")
        {
            var updated = lesson with { Date = input.Date, Hour = input.Hour, RescheduledAt = now };
            return state with { Lessons = [.. state.Lessons.Where(item => item.Id != lesson.Id), updated] };
        }

        if (lesson.SeriesId is null || lesson.OccurrenceIndex is not int index)
            throw new ApiFailure(400, "Esta é uma aula pontual. Use somente esta aula.");
        var series = state.Series.Single(item => item.Id == lesson.SeriesId);
        if (index > 0 && OccurrenceAt(series, index - 1) is { } previous && input.Date <= previous.Date)
            throw new ApiFailure(400, "O novo período deve começar depois da ocorrência anterior da série.");
        if (series.EndDate is { } end && input.Date > end)
            throw new ApiFailure(400, "O novo horário está depois do término desta série.");

        var updatedSeries = series with { Segments = [.. series.Segments.Where(segment => segment.FromIndex < index), new(index, input.Date, input.Hour)] };
        var stored = state.Lessons.Where(item => item.SeriesId == series.Id).ToDictionary(item => item.OccurrenceIndex!.Value);
        var preserved = state.Lessons.Where(item => item.SeriesId != series.Id || item.OccurrenceIndex < index || Started(item.Date, item.Hour)).ToList();
        // A postponed occurrence can be selected after later indices have already started.
        for (var position = 0; position < series.Segments.Count; position++)
        {
            var segment = series.Segments[position];
            var through = Math.Min(today.DayNumber, LastDay(series, position));
            var firstIndex = Math.Max(index, segment.FromIndex);
            for (var current = firstIndex; current <= segment.FromIndex + (through - segment.Date.DayNumber) / 7; current++)
            {
                var original = OccurrenceInSegment(series, segment, current);
                if (original is not null && original.Date.DayNumber <= through && !stored.ContainsKey(current) && Started(original.Date, original.Hour))
                    preserved.Add(original);
            }
        }
        return state with { Lessons = preserved, Series = state.Series.Select(item => item.Id == series.Id ? updatedSeries : item).ToList() };
    }

    public static void CheckConflicts(ScheduleData state)
    {
        var names = state.Students.ToDictionary(item => item.Id, item => item.Name);
        var exceptions = state.Lessons.Where(item => item.SeriesId is not null).ToLookup(item => item.SeriesId!);
        var rules = new List<Occupancy>();
        rules.AddRange(state.Lessons.Select(lesson => new Occupancy(names[lesson.StudentId], lesson.Date.DayNumber, lesson.Date.DayNumber, lesson.Hour, lesson.Hour + 1, false, null)));
        rules.AddRange(state.Blocks.Select(block => new Occupancy(block.Title, block.Date.DayNumber,
            block.Repeat == "once" ? block.Date.DayNumber : (block.EndDate ?? DateOnly.MaxValue).DayNumber,
            block.StartHour, block.EndHour, block.Repeat == "weekly", null)));
        foreach (var series in state.Series)
        {
            var skipped = new HashSet<int>();
            foreach (var item in exceptions[series.Id])
                if (OccurrenceAt(series, item.OccurrenceIndex!.Value) is { } original) skipped.Add(original.Date.DayNumber);
            for (var position = 0; position < series.Segments.Count; position++)
            {
                var segment = series.Segments[position];
                rules.Add(new Occupancy(names[series.StudentId], segment.Date.DayNumber, LastDay(series, position),
                    segment.Hour, segment.Hour + 1, true, skipped));
            }
        }
        rules.Sort((a, b) => a.First.CompareTo(b.First));
        for (var i = 0; i < rules.Count; i++)
        {
            var current = rules[i];
            for (var j = i + 1; j < rules.Count && rules[j].First <= current.Last; j++)
            {
                var other = rules[j];
                if (Intersection(current, other) is not int day) continue;
                var date = DateOnly.FromDayNumber(day).ToString("dd/MM/yyyy", CultureInfo.InvariantCulture);
                throw new ApiFailure(409, $"Conflito em {date} às {Math.Max(current.Start, other.Start):00}:00. Horário ocupado por {current.Label} e {other.Label}. Nada foi alterado.");
            }
        }
    }

    private static void ValidateSlot(DateOnly date, int hour)
    {
        if (date.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday)
            throw new ApiFailure(400, "Escolha um dia de segunda a sexta.");
        if (hour is < 7 or > 22) throw new ApiFailure(400, "Escolha um horário entre 07h e 22h.");
    }

    private static void ValidateEnd(DateOnly first, bool weekly, DateOnly? last)
    {
        if (last.HasValue && (!weekly || last.Value < first))
            throw new ApiFailure(400, "A data de término só vale para repetições e deve ser igual ou posterior ao início.");
    }

    internal static ScheduleLesson? FindLesson(ScheduleData state, string id)
    {
        var stored = state.Lessons.Find(item => item.Id == id);
        if (stored is not null) return stored;
        var parts = id?.Split('/');
        if (parts is not ["weekly", var seriesId, var occurrence] || !int.TryParse(occurrence, out var index) || index < 0)
            return null;
        var series = state.Series.Find(item => item.Id == seriesId);
        var generated = series is null ? null : OccurrenceAt(series, index);
        return generated?.Id == id ? generated : null;
    }

    private static ScheduleLesson? OccurrenceAt(ScheduleSeries series, int index)
    {
        var segment = series.Segments.FindLast(item => item.FromIndex <= index);
        return segment is null ? null : OccurrenceInSegment(series, segment, index);
    }

    private static ScheduleLesson? OccurrenceInSegment(ScheduleSeries series, ScheduleSegment segment, int index)
    {
        var day = segment.Date.DayNumber + ((long)index - segment.FromIndex) * 7;
        if (day > (series.EndDate ?? DateOnly.MaxValue).DayNumber) return null;
        return new ScheduleLesson($"weekly/{series.Id}/{index}", series.StudentId, DateOnly.FromDayNumber((int)day), segment.Hour, series.CreatedAt, series.Id, index);
    }

    private static int LastDay(ScheduleSeries series, int position)
    {
        var through = (series.EndDate ?? DateOnly.MaxValue).DayNumber;
        if (position + 1 == series.Segments.Count) return through;
        var segment = series.Segments[position];
        return (int)Math.Min(through, segment.Date.DayNumber + ((long)series.Segments[position + 1].FromIndex - segment.FromIndex - 1) * 7);
    }

    private static int? Intersection(Occupancy a, Occupancy b)
    {
        if (a.End <= b.Start || b.End <= a.Start) return null;
        if (a.Weekly && b.Weekly && (a.First - b.First) % 7 != 0) return null;
        var first = Math.Max(a.First, b.First);
        var last = Math.Min(a.Last, b.Last);
        var weekly = a.Weekly ? a : b.Weekly ? b : null;
        var candidate = weekly is null ? first : first + ((weekly.First - first) % 7 + 7) % 7;
        while (candidate <= last)
        {
            if (a.Skipped?.Contains(candidate) != true && b.Skipped?.Contains(candidate) != true) return candidate;
            if (!a.Weekly || !b.Weekly) return null;
            candidate += 7;
        }
        return null;
    }

    private sealed record Occupancy(string Label, int First, int Last, int Start, int End, bool Weekly, HashSet<int>? Skipped);
}
