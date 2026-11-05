using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using NextageClass.Api.Scheduling;
using TestApplication = NextageClass.Api.Tests.AccountAccessTests.AccessApplication;

namespace NextageClass.Api.Tests;

[Collection("ApiDatabase")]
public sealed class ScheduleTests(AccessDatabase database)
{
    private static readonly DateOnly Monday = new(2030, 1, 7);
    private const string Agenda = "/api/agenda";

    [Fact]
    public async Task ConcurrentWritersCannotBookTheSameSlot()
    {
        var (_, student) = await database.AddStudentAsync();
        await using var app = new TestApplication(database.Connection);
        using var teacher = await TeacherAsync(app);
        using var anotherTab = await TeacherAsync(app);
        var input = new ScheduleLessonInput(student, Monday, 7, false, null);
        var responses = await Task.WhenAll(teacher.PostAsJsonAsync(Agenda + "/lessons", input), anotherTab.PostAsJsonAsync(Agenda + "/lessons", input));
        try
        {
            Assert.Single(responses, response => response.StatusCode == HttpStatusCode.OK);
            Assert.Single(responses, response => response.StatusCode == HttpStatusCode.Conflict);
        }
        finally { foreach (var response in responses) response.Dispose(); }
        Assert.Single((await ReadAsync(teacher)).Lessons, lesson => lesson.StudentId == student);
    }

    [Fact]
    public async Task UnboundedRulesCheckDistantDatesAndHonorInclusiveEndDates()
    {
        var (_, student) = await database.AddStudentAsync();
        await using var app = new TestApplication(database.Connection);
        using var teacher = await TeacherAsync(app);
        var distant = Monday.AddDays(7 * 2000 + 1);
        await SaveAsync(teacher, "/lessons", new ScheduleLessonInput(student, distant, 10, false, null));
        var start = Monday.AddDays(1);
        using var conflict = await teacher.PostAsJsonAsync(Agenda + "/lessons", new ScheduleLessonInput(student, start, 10, true, null));
        Assert.Equal(HttpStatusCode.Conflict, conflict.StatusCode);
        Assert.Contains(distant.ToString("dd/MM/yyyy", System.Globalization.CultureInfo.InvariantCulture), await conflict.Content.ReadAsStringAsync());
        Assert.DoesNotContain((await ReadAsync(teacher)).Series, series => series.StudentId == student);

        var bounded = await SaveAsync(teacher, "/lessons", new ScheduleLessonInput(student, start, 10, true, distant.AddDays(-1)));
        Assert.Equal(distant.AddDays(-1), Assert.Single(bounded.Series, series => series.StudentId == student).EndDate);
        using var touchesLastDay = await teacher.PostAsJsonAsync(Agenda + "/blocks", new ScheduleBlockInput("Limite da série", distant.AddDays(-7), 10, 11, "once", null));
        Assert.Equal(HttpStatusCode.Conflict, touchesLastDay.StatusCode);
        await SaveAsync(teacher, "/lessons", new ScheduleLessonInput(student, start, 11, true, null));
        Assert.Contains((await ReadAsync(teacher)).Series, series => series.StudentId == student && series.EndDate is null);
    }

    [Fact]
    public async Task SingleMoveFreesTheOriginalSlotAndRejectsAStaleTab()
    {
        var (_, student) = await database.AddStudentAsync();
        await using var app = new TestApplication(database.Connection, services => services.AddSingleton<TimeProvider>(new ScheduleClock()));
        using var teacher = await TeacherAsync(app);
        var start = Monday.AddDays(2);
        var scheduled = await SaveAsync(teacher, "/lessons", new ScheduleLessonInput(student, start, 12, true, start.AddDays(21)));
        var series = Assert.Single(scheduled.Series, item => item.StudentId == student);
        var command = new RescheduleInput($"weekly/{series.Id}/0", start, 12, start.AddDays(1), 13, "single");
        var moved = await SaveAsync(teacher, "/reschedules", command);
        var exception = Assert.Single(moved.Lessons, lesson => lesson.SeriesId == series.Id);
        Assert.Equal(command.LessonId, exception.Id);
        Assert.Equal(command.Date, exception.Date);
        Assert.Equal(series.CreatedAt, exception.CreatedAt);
        await SaveAsync(teacher, "/lessons", new ScheduleLessonInput(student, start, 12, false, null));
        using var stale = await teacher.PostAsJsonAsync(Agenda + "/reschedules", command with { Hour = 14 });
        Assert.Equal(HttpStatusCode.Conflict, stale.StatusCode);
        Assert.Equal(exception, Assert.Single((await ReadAsync(teacher)).Lessons, lesson => lesson.SeriesId == series.Id));
        Assert.Single(Assert.Single((await ReadAsync(teacher)).Series, item => item.Id == series.Id).Segments);
    }

    [Fact]
    public async Task FollowingMoveRollsBackOnConflictAndPreservesAlreadyStartedIndices()
    {
        var (_, student) = await database.AddStudentAsync();
        var clock = new ScheduleClock { Now = new(2026, 10, 1, 15, 0, 0, TimeSpan.Zero) };
        await using var app = new TestApplication(database.Connection, services => services.AddSingleton<TimeProvider>(clock));
        using var teacher = await TeacherAsync(app);
        var start = new DateOnly(2026, 10, 5);
        var created = await SaveAsync(teacher, "/lessons", new ScheduleLessonInput(student, start, 14, true, new(2027, 1, 1)));
        var series = Assert.Single(created.Series, item => item.StudentId == student);
        var postponed = new DateOnly(2026, 11, 9);
        await SaveAsync(teacher, "/reschedules", new RescheduleInput($"weekly/{series.Id}/0", start, 14, postponed, 15, "single"));
        await SaveAsync(teacher, "/reschedules", new RescheduleInput($"weekly/{series.Id}/6", start.AddDays(42), 14, new(2026, 11, 20), 14, "single"));
        clock.Now = new(2026, 11, 5, 15, 0, 0, TimeSpan.Zero);
        var target = new DateOnly(2026, 11, 10);
        var occupied = await SaveAsync(teacher, "/blocks", new ScheduleBlockInput("Conflito distante 3C3", target.AddDays(35), 16, 17, "once", null));
        var block = Assert.Single(occupied.Blocks, item => item.Title == "Conflito distante 3C3");
        database.TrackScheduleBlock(block.Id);
        var command = new RescheduleInput($"weekly/{series.Id}/0", postponed, 15, target, 16, "following");
        using var rejected = await teacher.PostAsJsonAsync(Agenda + "/reschedules", command);
        Assert.Equal(HttpStatusCode.Conflict, rejected.StatusCode);
        var afterConflict = await ReadAsync(teacher);
        Assert.Equal(new[] { 0, 6 }, afterConflict.Lessons.Where(lesson => lesson.SeriesId == series.Id).Select(lesson => lesson.OccurrenceIndex!.Value).Order());
        Assert.Equal(start, Assert.Single(Assert.Single(afterConflict.Series, item => item.Id == series.Id).Segments).Date);

        using var removed = await teacher.DeleteAsync(Agenda + "/blocks/" + block.Id);
        removed.EnsureSuccessStatusCode();
        await SaveAsync(teacher, "/reschedules", command);
        var after = await ReadAsync(teacher);
        var history = after.Lessons.Where(lesson => lesson.SeriesId == series.Id).OrderBy(lesson => lesson.OccurrenceIndex).ToArray();
        Assert.Equal(new[] { 1, 2, 3, 4 }, history.Select(lesson => lesson.OccurrenceIndex!.Value));
        Assert.All(history, lesson =>
        {
            Assert.Equal(start.AddDays(lesson.OccurrenceIndex!.Value * 7), lesson.Date);
            Assert.Equal(14, lesson.Hour);
        });
        Assert.Equal(new ScheduleSegment(0, target, 16), Assert.Single(Assert.Single(after.Series, item => item.Id == series.Id).Segments));
        using var oldLesson = await teacher.PostAsJsonAsync(Agenda + "/reschedules", new RescheduleInput(history[0].Id, history[0].Date, 14, postponed, 14, "single"));
        Assert.Equal(HttpStatusCode.BadRequest, oldLesson.StatusCode);
    }

    [Fact]
    public async Task WeeklyBlockKeepsBothBoundariesAndReleasesItsSlotsWhenRemoved()
    {
        var (_, student) = await database.AddStudentAsync();
        await using var app = new TestApplication(database.Connection);
        using var teacher = await TeacherAsync(app);
        var start = Monday.AddDays(3);
        var created = await SaveAsync(teacher, "/blocks", new ScheduleBlockInput("   ", start, 19, 23, "weekly", start.AddDays(7)));
        var block = Assert.Single(created.Blocks, item => item.Date == start && item.StartHour == 19);
        database.TrackScheduleBlock(block.Id);
        Assert.Equal("Horário ocupado", block.Title);
        await SaveAsync(teacher, "/lessons", new ScheduleLessonInput(student, start.AddDays(7), 18, false, null));
        using var conflict = await teacher.PostAsJsonAsync(Agenda + "/lessons", new ScheduleLessonInput(student, start.AddDays(7), 22, false, null));
        Assert.Equal(HttpStatusCode.Conflict, conflict.StatusCode);
        await SaveAsync(teacher, "/lessons", new ScheduleLessonInput(student, start.AddDays(14), 22, false, null));
        using var removed = await teacher.DeleteAsync(Agenda + "/blocks/" + block.Id);
        removed.EnsureSuccessStatusCode();
        await SaveAsync(teacher, "/lessons", new ScheduleLessonInput(student, start.AddDays(7), 22, false, null));
        Assert.Equal(3, (await ReadAsync(teacher)).Lessons.Count(item => item.StudentId == student));
    }

    [Fact]
    public async Task CommandsValidateInputAndRequireTeacherAuthorization()
    {
        var (user, student) = await database.AddStudentAsync();
        await using var app = new TestApplication(database.Connection);
        using var visitor = app.CreateClient();
        using var anonymous = await visitor.GetAsync(Agenda);
        Assert.Equal(HttpStatusCode.Unauthorized, anonymous.StatusCode);
        visitor.DefaultRequestHeaders.Authorization = new("Bearer", app.Token(user.ToString()));
        using var forbiddenRead = await visitor.GetAsync(Agenda);
        using var forbiddenWrite = await visitor.PostAsJsonAsync(Agenda + "/lessons", new ScheduleLessonInput(student, Monday, 20, false, null));
        using var forbiddenDelete = await visitor.DeleteAsync(Agenda + "/blocks/missing");
        Assert.Equal(HttpStatusCode.Forbidden, forbiddenRead.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, forbiddenWrite.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, forbiddenDelete.StatusCode);
        using var teacher = await TeacherAsync(app);
        foreach (var input in new[]
        {
            new ScheduleLessonInput("missing", Monday, 20, false, null),
            new ScheduleLessonInput(student, Monday.AddDays(5), 20, false, null),
            new ScheduleLessonInput(student, Monday, 23, false, null),
            new ScheduleLessonInput(student, Monday, 20, false, Monday),
            new ScheduleLessonInput(student, Monday, 20, true, Monday.AddDays(-1))
        })
        {
            using var invalid = await teacher.PostAsJsonAsync(Agenda + "/lessons", input);
            Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);
        }
        using var invalidBlock = await teacher.PostAsJsonAsync(Agenda + "/blocks", new ScheduleBlockInput("", Monday, 20, 20, "weekly", null));
        Assert.Equal(HttpStatusCode.BadRequest, invalidBlock.StatusCode);
        using var missingBlock = await teacher.DeleteAsync(Agenda + "/blocks/missing");
        Assert.Equal(HttpStatusCode.NotFound, missingBlock.StatusCode);
        Assert.DoesNotContain((await ReadAsync(teacher)).Lessons, lesson => lesson.StudentId == student);
    }

    private async Task<HttpClient> TeacherAsync(TestApplication app)
    {
        var client = app.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", app.Token((await database.AddTeacherAsync()).ToString()));
        return client;
    }

    private static async Task<ScheduleData> ReadAsync(HttpClient client) => (await client.GetFromJsonAsync<ScheduleData>(Agenda))!;

    private static async Task<ScheduleData> SaveAsync<T>(HttpClient client, string path, T input)
    {
        using var response = await client.PostAsJsonAsync(Agenda + path, input);
        Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync());
        return (await response.Content.ReadFromJsonAsync<ScheduleData>())!;
    }

    private sealed class ScheduleClock : TimeProvider
    {
        public DateTimeOffset Now { get; set; } = new(2026, 11, 5, 15, 0, 0, TimeSpan.Zero);
        public override DateTimeOffset GetUtcNow() => Now;
    }
}
