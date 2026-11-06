using System.Text.Json.Serialization;

namespace NextageClass.Api.Scheduling;

public sealed record ScheduleStudent(string Id, string Name, string Level, string MeetingUrl, string? PrimaryBookId = null);
public sealed record ScheduleLesson(string Id, string StudentId, DateOnly Date, int Hour, DateTime CreatedAt,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] string? SeriesId = null,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] int? OccurrenceIndex = null,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] DateTime? RescheduledAt = null);
public sealed record ScheduleSegment(int FromIndex, DateOnly Date, int Hour);
public sealed record ScheduleSeries(string Id, string StudentId, DateTime CreatedAt, DateOnly? EndDate, List<ScheduleSegment> Segments);
public sealed record ScheduleBlock(string Id, string Title, DateOnly Date, int StartHour, int EndHour, string Repeat, DateOnly? EndDate, DateTime CreatedAt);
public sealed record ScheduleData(List<ScheduleStudent> Students, List<ScheduleLesson> Lessons, List<ScheduleSeries> Series, List<ScheduleBlock> Blocks);

public sealed record ScheduleLessonInput(string StudentId, [property: JsonRequired] DateOnly Date, int Hour, bool Weekly, DateOnly? EndDate);
public sealed record ScheduleBlockInput(string? Title, [property: JsonRequired] DateOnly Date, int StartHour, int EndHour, string Repeat, DateOnly? EndDate);
public sealed record RescheduleInput(string LessonId, [property: JsonRequired] DateOnly ExpectedDate, int ExpectedHour,
    [property: JsonRequired] DateOnly Date, int Hour, string Scope);
