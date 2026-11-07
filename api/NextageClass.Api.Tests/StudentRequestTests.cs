using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using NextageClass.Api.Scheduling;
using TestApplication = NextageClass.Api.Tests.AccountAccessTests.AccessApplication;

namespace NextageClass.Api.Tests;

[Collection("ApiDatabase")]
public sealed class StudentRequestTests(AccessDatabase database)
{
    [Fact]
    public async Task RequestsArePrivateDoNotReserveAndRecheckLongTermAvailability()
    {
        var (firstUser, first) = await database.AddStudentAsync();
        var (secondUser, second) = await database.AddStudentAsync();
        await using var app = new TestApplication(database.Connection);
        using var teacher = app.CreateClient();
        teacher.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", app.Token((await database.AddTeacherAsync()).ToString()));
        using var firstClient = app.CreateClient();
        firstClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", app.Token(firstUser.ToString()));
        using var secondClient = app.CreateClient();
        secondClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", app.Token(secondUser.ToString()));
        using var anonymous = app.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync("/api/student/requests")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await teacher.GetAsync("/api/student/requests")).StatusCode);
        Assert.Empty((await firstClient.GetFromJsonAsync<int[]>("/api/student/requests/availability?kind=once&date=2020-01-06"))!);
        Assert.Equal(HttpStatusCode.BadRequest, (await firstClient.GetAsync("/api/student/requests/availability?kind=once&date=2040-01-07")).StatusCode);
        var date = new DateOnly(2040, 1, 2);
        Assert.Equal(DayOfWeek.Monday, date.DayOfWeek);
        var distant = date.AddDays(7000);
        var lesson = await teacher.PostAsJsonAsync("/api/agenda/lessons", new ScheduleLessonInput(second, distant, 17, false, null));
        lesson.EnsureSuccessStatusCode();
        var url = "/api/student/requests/availability?kind=weekly&date=2040-01-02";
        var raw = await firstClient.GetStringAsync(url);
        Assert.DoesNotContain("Test student", raw);
        var hours = await firstClient.GetFromJsonAsync<int[]>(url);
        Assert.DoesNotContain(17, hours!);
        var once = await firstClient.GetFromJsonAsync<int[]>("/api/student/requests/availability?kind=once&date=2040-01-02");
        Assert.Contains(17, once!);
        var seriesResponse = await teacher.PostAsJsonAsync("/api/agenda/lessons", new ScheduleLessonInput(second, date, 21, true, date.AddDays(14)));
        seriesResponse.EnsureSuccessStatusCode();
        var series = Assert.Single((await seriesResponse.Content.ReadFromJsonAsync<ScheduleData>())!.Series, x => x.StudentId == second && x.Segments[0].Hour == 21);
        var moved = await teacher.PostAsJsonAsync("/api/agenda/reschedules", new RescheduleInput($"weekly/{series.Id}/0", date, 21, date.AddDays(1), 19, "single"));
        moved.EnsureSuccessStatusCode();
        var block = await teacher.PostAsJsonAsync("/api/agenda/blocks", new ScheduleBlockInput("PRIVATE BLOCK", date, 20, 21, "once", null));
        block.EnsureSuccessStatusCode();
        var blockData = Assert.Single((await block.Content.ReadFromJsonAsync<ScheduleData>())!.Blocks, x => x.Title == "PRIVATE BLOCK");
        database.TrackScheduleBlock(blockData.Id);
        var afterMove = await firstClient.GetFromJsonAsync<int[]>("/api/student/requests/availability?kind=once&date=2040-01-02");
        Assert.Contains(21, afterMove!);
        Assert.DoesNotContain(20, afterMove!);
        var movedDay = await firstClient.GetFromJsonAsync<int[]>("/api/student/requests/availability?kind=once&date=2040-01-03");
        Assert.DoesNotContain(19, movedDay!);
        var movedWeekly = await firstClient.GetFromJsonAsync<int[]>("/api/student/requests/availability?kind=weekly&date=2040-01-02");
        Assert.DoesNotContain(21, movedWeekly!);
        var input = new StudentRequestInput("once", date, 17, null);
        var one = await firstClient.PostAsJsonAsync("/api/student/requests", input);
        one.EnsureSuccessStatusCode();
        Assert.Equal(HttpStatusCode.Conflict, (await firstClient.PostAsJsonAsync("/api/student/requests", input)).StatusCode);
        (await secondClient.PostAsJsonAsync("/api/student/requests", input)).EnsureSuccessStatusCode();
        var mine = await firstClient.GetFromJsonAsync<List<StudentRequestData>>($"/api/student/requests?studentId={second}");
        Assert.NotNull(mine);
        Assert.Single(mine);
        Assert.Equal("pending", mine[0].Status);
        Assert.Equal(mine[0].Id, Assert.Single((await firstClient.GetFromJsonAsync<List<StudentRequestData>>("/api/student/requests"))!).Id);
        var other = Assert.Single((await secondClient.GetFromJsonAsync<List<StudentRequestData>>("/api/student/requests"))!);
        Assert.NotEqual(mine[0].Id, other.Id);
        Assert.DoesNotContain((await teacher.GetFromJsonAsync<ScheduleData>("/api/agenda"))!.Lessons, x => x.StudentId == first && x.Date == date);
        Assert.Equal(HttpStatusCode.Conflict, (await firstClient.PostAsJsonAsync("/api/student/requests", new StudentRequestInput("weekly", date, 17, null))).StatusCode);
    }
}