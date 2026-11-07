using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using NextageClass.Api.Scheduling;
using Npgsql;
using TestApplication = NextageClass.Api.Tests.AccountAccessTests.AccessApplication;

namespace NextageClass.Api.Tests;

[Collection("ApiDatabase")]
public sealed class TeacherRequestTests(AccessDatabase database)
{
    [Fact]
    public async Task ConcurrentApprovalsAndScheduleChangesKeepPendingRequestsAndOneBooking()
    {
        var (firstUser, first) = await database.AddStudentAsync();
        var (secondUser, second) = await database.AddStudentAsync();
        await using var app = new TestApplication(database.Connection);
        using var teacher = app.CreateClient();
        teacher.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", app.Token((await database.AddTeacherAsync()).ToString()));
        using var student = app.CreateClient();
        student.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", app.Token(firstUser.ToString()));
        using var other = app.CreateClient();
        other.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", app.Token(secondUser.ToString()));
        using var visitor = app.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await visitor.GetAsync("/api/teacher/requests")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await student.GetAsync("/api/teacher/requests")).StatusCode);
        var date = new DateOnly(2040, 1, 2);
        var request = new StudentRequestInput("once", date, 14, null);
        var a = (await (await student.PostAsJsonAsync("/api/student/requests", request)).Content.ReadFromJsonAsync<StudentRequestData>())!;
        var b = (await (await other.PostAsJsonAsync("/api/student/requests", request)).Content.ReadFromJsonAsync<StudentRequestData>())!;
        Assert.Equal(HttpStatusCode.Forbidden, (await student.PostAsJsonAsync($"/api/teacher/requests/{a.Id}/decision", new RequestDecisionInput("approved"))).StatusCode);
        var responses = await Task.WhenAll(teacher.PostAsJsonAsync($"/api/teacher/requests/{a.Id}/decision", new RequestDecisionInput("approved")), teacher.PostAsJsonAsync($"/api/teacher/requests/{b.Id}/decision", new RequestDecisionInput("approved")));
        Assert.Single(responses, x => x.StatusCode == HttpStatusCode.OK);
        Assert.Single(responses, x => x.StatusCode == HttpStatusCode.Conflict);
        var list = (await teacher.GetFromJsonAsync<List<TeacherRequestData>>("/api/teacher/requests"))!;
        var approved = Assert.Single(list, x => (x.Id == a.Id || x.Id == b.Id) && x.Status == "approved");
        var pending = Assert.Single(list, x => (x.Id == a.Id || x.Id == b.Id) && x.Status == "pending");
        Assert.Equal(HttpStatusCode.Conflict, (await teacher.PostAsJsonAsync($"/api/teacher/requests/{approved.Id}/decision", new RequestDecisionInput("approved"))).StatusCode);
        var agenda = (await teacher.GetFromJsonAsync<ScheduleData>("/api/agenda"))!;
        Assert.Single(agenda.Lessons, x => x.Id == approved.BookingId && x.Date == date && x.Hour == 14);
        var declined = await teacher.PostAsJsonAsync($"/api/teacher/requests/{pending.Id}/decision", new RequestDecisionInput("declined"));
        declined.EnsureSuccessStatusCode();
        Assert.Equal("declined", (await declined.Content.ReadFromJsonAsync<TeacherRequestData>())!.Status);
        Assert.Single((await teacher.GetFromJsonAsync<ScheduleData>("/api/agenda"))!.Lessons, x => x.Date == date && x.Hour == 14);
        var racingDate = date.AddDays(3);
        var racingRequest = (await (await student.PostAsJsonAsync("/api/student/requests", new StudentRequestInput("once", racingDate, 16, null))).Content.ReadFromJsonAsync<StudentRequestData>())!;
        var race = await Task.WhenAll(
            teacher.PostAsJsonAsync($"/api/teacher/requests/{racingRequest.Id}/decision", new RequestDecisionInput("approved")),
            teacher.PostAsJsonAsync("/api/agenda/lessons", new ScheduleLessonInput(second, racingDate, 16, false, null)));
        Assert.Single(race, x => x.StatusCode == HttpStatusCode.OK);
        Assert.Single(race, x => x.StatusCode == HttpStatusCode.Conflict);
        Assert.Single((await teacher.GetFromJsonAsync<ScheduleData>("/api/agenda"))!.Lessons, x => x.Date == racingDate && x.Hour == 16);
        var successfulWeekly = (await (await student.PostAsJsonAsync("/api/student/requests", new StudentRequestInput("weekly", date.AddDays(4), 14, date.AddDays(18)))).Content.ReadFromJsonAsync<StudentRequestData>())!;
        var weeklyDecision = await teacher.PostAsJsonAsync($"/api/teacher/requests/{successfulWeekly.Id}/decision", new RequestDecisionInput("approved"));
        weeklyDecision.EnsureSuccessStatusCode();
        var weeklyBooking = (await weeklyDecision.Content.ReadFromJsonAsync<TeacherRequestData>())!;
        Assert.Single((await teacher.GetFromJsonAsync<ScheduleData>("/api/agenda"))!.Series, x => x.Id == weeklyBooking.BookingId && x.StudentId == first);
        Assert.Equal("approved", Assert.Single((await student.GetFromJsonAsync<List<StudentRequestData>>("/api/student/requests"))!, x => x.Id == successfulWeekly.Id).Status);
        var weekly = new StudentRequestInput("weekly", date.AddDays(2), 22, null);
        var pendingWeekly = (await (await student.PostAsJsonAsync("/api/student/requests", weekly)).Content.ReadFromJsonAsync<StudentRequestData>())!;
        var distant = weekly.Date.AddDays(7 * 2000);
        (await teacher.PostAsJsonAsync("/api/agenda/lessons", new ScheduleLessonInput(second, distant, 22, false, null))).EnsureSuccessStatusCode();
        Assert.Equal(HttpStatusCode.Conflict, (await teacher.PostAsJsonAsync($"/api/teacher/requests/{pendingWeekly.Id}/decision", new RequestDecisionInput("approved"))).StatusCode);
        Assert.Equal("pending", Assert.Single((await student.GetFromJsonAsync<List<StudentRequestData>>("/api/student/requests"))!, x => x.Id == pendingWeekly.Id).Status);
        Assert.DoesNotContain((await teacher.GetFromJsonAsync<ScheduleData>("/api/agenda"))!.Series, x => x.StudentId == first && x.Segments[0].Date == weekly.Date);
    }

    [Fact]
    public async Task FailureAfterBookingInsertRollsBackBookingAndDecision()
    {
        var (user, studentId) = await database.AddStudentAsync();
        await using var app = new TestApplication(database.Connection);
        using var teacher = app.CreateClient();
        teacher.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", app.Token((await database.AddTeacherAsync()).ToString()));
        using var student = app.CreateClient();
        student.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", app.Token(user.ToString()));
        var date = new DateOnly(2040, 1, 3);
        var response = await student.PostAsJsonAsync("/api/student/requests", new StudentRequestInput("once", date, 14, null));
        response.EnsureSuccessStatusCode();
        var item = (await response.Content.ReadFromJsonAsync<StudentRequestData>())!;
        await using var source = NpgsqlDataSource.Create(database.Connection);
        await using var connection = await source.OpenConnectionAsync();
        await using (var create = new NpgsqlCommand("CREATE FUNCTION app.test_request_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'forced rollback'; END $$; CREATE TRIGGER test_request_failure BEFORE UPDATE ON app.scheduling_requests FOR EACH ROW EXECUTE FUNCTION app.test_request_failure();", connection)) await create.ExecuteNonQueryAsync();
        try
        {
            Assert.Equal(HttpStatusCode.InternalServerError, (await teacher.PostAsJsonAsync($"/api/teacher/requests/{item.Id}/decision", new RequestDecisionInput("approved"))).StatusCode);
            Assert.Equal("pending", Assert.Single((await student.GetFromJsonAsync<List<StudentRequestData>>("/api/student/requests"))!, x => x.Id == item.Id).Status);
            Assert.DoesNotContain((await teacher.GetFromJsonAsync<ScheduleData>("/api/agenda"))!.Lessons, x => x.StudentId == studentId && x.Date == date && x.Hour == 14);
        }
        finally
        {
            await using var remove = new NpgsqlCommand("DROP TRIGGER test_request_failure ON app.scheduling_requests; DROP FUNCTION app.test_request_failure();", connection);
            await remove.ExecuteNonQueryAsync();
        }
    }
}