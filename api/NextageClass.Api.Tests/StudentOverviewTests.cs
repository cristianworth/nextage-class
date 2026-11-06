using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using NextageClass.Api.Catalog;
using NextageClass.Api.Scheduling;
using Npgsql;
using TestApplication = NextageClass.Api.Tests.AccountAccessTests.AccessApplication;

namespace NextageClass.Api.Tests;

[Collection("ApiDatabase")]
public sealed class StudentOverviewTests(AccessDatabase database)
{
    [Fact]
    public async Task CurrentLessonRemainsVisibleUntilItsBrasiliaEnd()
    {
        var (user, student) = await database.AddStudentAsync();
        var clock = new AdjustableClock { Now = new(2030, 1, 7, 23, 54, 0, TimeSpan.Zero) };
        await using var app = new TestApplication(database.Connection, services => services.AddSingleton<TimeProvider>(clock));
        using var teacher = app.CreateClient();
        teacher.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", app.Token((await database.AddTeacherAsync()).ToString()));
        using var client = app.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", app.Token(user.ToString()));
        (await teacher.PostAsJsonAsync("/api/agenda/lessons", new ScheduleLessonInput(student, new(2030, 1, 7), 20, false, null))).EnsureSuccessStatusCode();
        var active = await client.GetFromJsonAsync<StudentOverviewData>("/api/student/overview");
        Assert.Single(active!.Upcoming);
        clock.Now = clock.Now.AddMinutes(1);
        var ended = await client.GetFromJsonAsync<StudentOverviewData>("/api/student/overview");
        Assert.Empty(ended!.Upcoming);
    }

    [Fact]
    public async Task OwnOverviewFiltersPrivateFieldsAndUsesEffectiveWeeklyOccurrences()
    {
        var (user, student) = await database.AddStudentAsync();
        var (otherUser, other) = await database.AddStudentAsync();
        await using var app = new TestApplication(database.Connection, services => services.AddSingleton<TimeProvider>(new OverviewClock()));
        using var teacher = app.CreateClient();
        teacher.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", app.Token((await database.AddTeacherAsync()).ToString()));
        using var client = app.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", app.Token(user.ToString()));
        using var second = app.CreateClient();
        second.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", app.Token(otherUser.ToString()));
        using var visitor = app.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await visitor.GetAsync("/api/student/overview")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await teacher.GetAsync("/api/student/overview")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/agenda")).StatusCode);
        await using (var source = NpgsqlDataSource.Create(database.Connection))
        await using (var update = source.CreateCommand("UPDATE app.students SET meeting_url='https://example.test/own', occupation='PRIVATE_OCCUPATION' WHERE id=$1"))
        { update.Parameters.AddWithValue(student); await update.ExecuteNonQueryAsync(); }
        var bookResponse = await teacher.PostAsJsonAsync("/api/books", new BookInput("Public book", ["A1"]));
        bookResponse.EnsureSuccessStatusCode();
        var book = (await bookResponse.Content.ReadFromJsonAsync<BookData>())!; database.TrackBook(book.Id);
        var materialResponse = await teacher.PostAsJsonAsync("/api/materials", new MaterialInput("Shared unit", "Shared material", book.Id, 1));
        materialResponse.EnsureSuccessStatusCode();
        var material = (await materialResponse.Content.ReadFromJsonAsync<MaterialData>())!; database.TrackMaterial(material.Id);
        var past = await teacher.PostAsJsonAsync("/api/agenda/lessons", new ScheduleLessonInput(student, new(2026, 11, 2), 15, false, null));
        past.EnsureSuccessStatusCode();
        var pastLesson = Assert.Single((await past.Content.ReadFromJsonAsync<ScheduleData>())!.Lessons, item => item.StudentId == student);
        (await teacher.PostAsJsonAsync("/api/lesson-records", new { lessonId = pastLesson.Id, attendance = "attended", content = "PRIVATE_NOTES", usedMaterialId = material.Id, homework = "Shared task" })).EnsureSuccessStatusCode();
        var start = new DateOnly(2030, 1, 7);
        var scheduled = await teacher.PostAsJsonAsync("/api/agenda/lessons", new ScheduleLessonInput(student, start, 18, true, null));
        scheduled.EnsureSuccessStatusCode();
        var series = Assert.Single((await scheduled.Content.ReadFromJsonAsync<ScheduleData>())!.Series, item => item.StudentId == student);
        var movedId = $"weekly/{series.Id}/0";
        (await teacher.PostAsJsonAsync("/api/agenda/reschedules", new RescheduleInput(movedId, start, 18, start.AddDays(1), 19, "single"))).EnsureSuccessStatusCode();
        (await teacher.PostAsJsonAsync("/api/agenda/lessons", new ScheduleLessonInput(other, start.AddDays(2), 20, false, null))).EnsureSuccessStatusCode();
        var response = await client.GetAsync($"/api/student/overview?studentId={Uri.EscapeDataString(other)}");
        response.EnsureSuccessStatusCode();
        var raw = await response.Content.ReadAsStringAsync();
        Assert.DoesNotContain("PRIVATE_NOTES", raw); Assert.DoesNotContain("PRIVATE_OCCUPATION", raw);
        using var json = JsonDocument.Parse(raw);
        Assert.Equal(student, json.RootElement.GetProperty("student").GetProperty("id").GetString());
        Assert.Equal("https://example.test/own", json.RootElement.GetProperty("meetingUrl").GetString());
        var upcoming = json.RootElement.GetProperty("upcoming").EnumerateArray().ToArray();
        Assert.Equal(6, upcoming.Length);
        Assert.Equal(movedId, upcoming[0].GetProperty("id").GetString());
        Assert.Equal("2030-01-08", upcoming[0].GetProperty("date").GetString());
        Assert.DoesNotContain(other, raw);
        var history = Assert.Single(json.RootElement.GetProperty("history").EnumerateArray());
        Assert.False(history.TryGetProperty("content", out _)); Assert.False(history.TryGetProperty("reason", out _));
        Assert.Equal("Shared material", history.GetProperty("materialSnapshot").GetProperty("content").GetString());
        Assert.Equal("Shared task", history.GetProperty("homework").GetProperty("description").GetString());
        var otherOverview = await second.GetFromJsonAsync<JsonElement>("/api/student/overview");
        Assert.Equal(0, otherOverview.GetProperty("history").GetArrayLength());
        Assert.Equal(1, otherOverview.GetProperty("upcoming").GetArrayLength());
        Assert.Equal(raw, await client.GetStringAsync("/api/student/overview"));
    }

    private sealed class OverviewClock : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => new(2029, 12, 30, 12, 0, 0, TimeSpan.Zero);
    }
    private sealed class AdjustableClock : TimeProvider
    {
        public DateTimeOffset Now { get; set; }
        public override DateTimeOffset GetUtcNow() => Now;
    }
}
