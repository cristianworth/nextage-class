using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using NextageClass.Api.Catalog;
using NextageClass.Api.Scheduling;
using TestApplication = NextageClass.Api.Tests.AccountAccessTests.AccessApplication;

namespace NextageClass.Api.Tests;

[Collection("ApiDatabase")]
public sealed class LessonPlanTests(AccessDatabase database)
{
    [Fact]
    public async Task WeeklyPlanFollowsReschedulesAndRejectsMovingPastEndAtomically()
    {
        var (user, student) = await database.AddStudentAsync();
        var clock = new PlanClock { Now = new(2026, 11, 5, 12, 0, 0, TimeSpan.Zero) };
        await using var app = new TestApplication(database.Connection, services => services.AddSingleton<TimeProvider>(clock));
        using var client = app.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", app.Token((await database.AddTeacherAsync()).ToString()));
        using var denied = app.CreateClient();
        denied.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", app.Token(user.ToString()));
        Assert.Equal(HttpStatusCode.Forbidden, (await denied.GetAsync("/api/lesson-plans")).StatusCode);
        var start = new DateOnly(2030, 1, 7);
        var created = await client.PostAsJsonAsync("/api/agenda/lessons", new ScheduleLessonInput(student, start, 16, true, start.AddDays(28)));
        created.EnsureSuccessStatusCode();
        var series = Assert.Single((await created.Content.ReadFromJsonAsync<ScheduleData>())!.Series, item => item.StudentId == student);
        var id = $"weekly/{series.Id}/2";
        var materialResponse = await client.PostAsJsonAsync("/api/materials", new MaterialInput("Apoio planejado", "Texto fictício", Levels: ["A1"]));
        materialResponse.EnsureSuccessStatusCode();
        var material = (await materialResponse.Content.ReadFromJsonAsync<MaterialData>())!;
        database.TrackMaterial(material.Id);
        var input = new LessonPlanInput(id, start.AddDays(14), 16, material.Id, "Retomar perguntas");
        (await client.PostAsJsonAsync("/api/lesson-plans", input)).EnsureSuccessStatusCode();
        Assert.Equal("Retomar perguntas", Assert.Single((await client.GetFromJsonAsync<List<LessonPlanData>>("/api/lesson-plans"))!, item => item.LessonId == id).Notes);
        Assert.Equal(material.Id, Assert.Single((await client.GetFromJsonAsync<List<LessonPlanData>>("/api/lesson-plans"))!, item => item.LessonId == id).MaterialId);
        var invalid = new RescheduleInput($"weekly/{series.Id}/0", start, 16, start.AddDays(21), 16, "following");
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/agenda/reschedules", invalid)).StatusCode);
        var unchanged = (await client.GetFromJsonAsync<ScheduleData>("/api/agenda"))!;
        Assert.Equal(start.AddDays(14), Assert.Single(unchanged.Lessons, item => item.Id == id).Date);
        var move = invalid with { Date = start.AddDays(1), Hour = 17 };
        (await client.PostAsJsonAsync("/api/agenda/reschedules", move)).EnsureSuccessStatusCode();
        var after = (await client.GetFromJsonAsync<ScheduleData>("/api/agenda"))!;
        var moved = Assert.Single(after.Lessons, item => item.Id == id);
        Assert.Equal(start.AddDays(15), moved.Date);
        Assert.Equal(17, moved.Hour);
        Assert.Equal("Retomar perguntas", Assert.Single((await client.GetFromJsonAsync<List<LessonPlanData>>("/api/lesson-plans"))!, item => item.LessonId == id).Notes);
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsJsonAsync("/api/lesson-plans", input)).StatusCode);
        var single = new RescheduleInput(id, moved.Date, moved.Hour, moved.Date.AddDays(1), 18, "single");
        (await client.PostAsJsonAsync("/api/agenda/reschedules", single)).EnsureSuccessStatusCode();
        Assert.Equal("Retomar perguntas", Assert.Single((await client.GetFromJsonAsync<List<LessonPlanData>>("/api/lesson-plans"))!, item => item.LessonId == id).Notes);
        var clear = new LessonPlanInput(id, single.Date, single.Hour, null, "");
        (await client.PostAsJsonAsync("/api/lesson-plans", clear)).EnsureSuccessStatusCode();
        Assert.DoesNotContain((await client.GetFromJsonAsync<List<LessonPlanData>>("/api/lesson-plans"))!, item => item.LessonId == id);
        clock.Now = new DateTimeOffset(single.Date.ToDateTime(new TimeOnly(21, 55)), TimeSpan.Zero);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/lesson-plans", clear with { Notes = "Tarde" })).StatusCode);
    }

    private sealed class PlanClock : TimeProvider
    {
        public DateTimeOffset Now { get; set; }
        public override DateTimeOffset GetUtcNow() => Now;
    }
}
