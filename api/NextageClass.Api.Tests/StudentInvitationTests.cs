using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using NextageClass.Api.Invitations;
using NextageClass.Api.Students;
using TestApplication = NextageClass.Api.Tests.AccountAccessTests.AccessApplication;

namespace NextageClass.Api.Tests;

[Collection("ApiDatabase")]
public sealed class StudentInvitationTests(AccessDatabase database)
{
    private async Task<HttpClient> TeacherAsync(TestApplication application)
    {
        var client = application.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", application.Token((await database.AddTeacherAsync()).ToString()));
        return client;
    }

    private async Task<string> CreateStudentAsync(HttpClient client)
    {
        using var response = await client.PostAsJsonAsync("/api/students", new StudentInput(" Test learner ", "A1", new DateOnly(2026, 10, 25)));
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var student = await response.Content.ReadFromJsonAsync<StudentData>();
        Assert.NotNull(student);
        database.TrackStudent(student.Id);
        Assert.Equal("Test learner", student.Name);
        Assert.Equal("", student.Phone);
        return student.Id;
    }

    private static TestApplication Application(AccessDatabase database, FakeProvider provider) =>
        new(database.Connection, services => services.AddSingleton<IInvitationProvider>(provider));

    [Fact]
    public async Task StudentAndUnlinkedUserCannotListCreateOrInviteStudents()
    {
        var provider = new FakeProvider();
        var (id, studentId) = await database.AddStudentAsync();
        await using var application = Application(database, provider);
        using var client = application.CreateClient();
        foreach (var userId in new[] { id, Guid.NewGuid() })
        {
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", application.Token(userId.ToString()));
            Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/students")).StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync("/api/students", new StudentInput("Blocked", "A1", new DateOnly(2026, 10, 25)))).StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync($"/api/students/{Uri.EscapeDataString(studentId)}/invitation", new InvitationInput("blocked@example.test"))).StatusCode);
        }
        Assert.Equal(0, provider.Calls);
    }

    [Fact]
    public async Task TeacherCreatesValidatedStudentsAndReadsThemAfterAnotherRequest()
    {
        await using var application = Application(database, new FakeProvider());
        using var client = await TeacherAsync(application);
        var id = await CreateStudentAsync(client);
        var students = await client.GetFromJsonAsync<List<StudentData>>("/api/students");
        Assert.Contains(students!, student => student.Id == id && student.Name == "Test learner");
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/students", new { name = "Missing date", level = "A1" })).StatusCode);
        foreach (var input in new[] {
            new StudentInput("", "A1", new DateOnly(2026,10,25)),
            new StudentInput("Invalid", "A3", new DateOnly(2026,10,25)),
            new StudentInput("Invalid", "A1", new DateOnly(2026,10,25), MeetingUrl: "javascript:alert(1)"),
            new StudentInput("Invalid", "A1", new DateOnly(2026,10,25), MeetingUrl: "https://user:secret@example.test") })
            Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/students", input)).StatusCode);
    }

    [Fact]
    public async Task ConfirmedInviteLinksExactlyTheChosenStudentWithStudentRole()
    {
        var provider = new FakeProvider();
        await using var application = Application(database, provider);
        using var client = await TeacherAsync(application);
        var id = await CreateStudentAsync(client);
        var email = $"learner-{Guid.NewGuid():N}@example.test";
        using var response = await client.PostAsJsonAsync($"/api/students/{id}/invitation", new InvitationInput(email));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var receipt = await response.Content.ReadFromJsonAsync<InvitationReceipt>();
        Assert.Equal("sent", receipt!.Status);
        Assert.Equal(id, receipt.StudentId);
        Assert.Equal(1, provider.Calls);
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsJsonAsync($"/api/students/{id}/invitation", new InvitationInput(email))).StatusCode);
        Assert.Equal(1, provider.Calls);
        using var learner = application.CreateClient();
        learner.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", application.Token(provider.Identity.ToString()));
        var session = await learner.GetFromJsonAsync<JsonElement>("/api/session");
        Assert.Equal("student", session.GetProperty("role").GetString());
        Assert.Equal(id, session.GetProperty("studentId").GetString());
        Assert.Equal(HttpStatusCode.Forbidden, (await learner.GetAsync("/api/invitations")).StatusCode);
    }

    [Fact]
    public async Task MissingConfigurationNeverClaimsAnEmailWasSent()
    {
        await using var application = new TestApplication(database.Connection);
        using var client = await TeacherAsync(application);
        var id = await CreateStudentAsync(client);
        using var response = await client.PostAsJsonAsync($"/api/students/{id}/invitation", new InvitationInput("not-sent@example.test"));
        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Contains("Nenhum convite foi enviado", await response.Content.ReadAsStringAsync());
        var invitations = await client.GetFromJsonAsync<List<InvitationReceipt>>("/api/invitations");
        Assert.DoesNotContain(invitations!, invitation => invitation.StudentId == id);
    }

    [Fact]
    public async Task ProviderFailureRequiresReviewAndCannotSendAgainAutomatically()
    {
        var provider = new FakeProvider { Fail = true };
        await using var application = Application(database, provider);
        using var client = await TeacherAsync(application);
        var id = await CreateStudentAsync(client);
        var email = $"failed-{Guid.NewGuid():N}@example.test";
        using var response = await client.PostAsJsonAsync($"/api/students/{id}/invitation", new InvitationInput(email));
        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.DoesNotContain("PRIVATE_PROVIDER_ERROR", await response.Content.ReadAsStringAsync());
        var invitations = await client.GetFromJsonAsync<List<InvitationReceipt>>("/api/invitations");
        Assert.Contains(invitations!, invitation => invitation.StudentId == id && invitation.Status == "needs_review");
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsJsonAsync($"/api/students/{id}/invitation", new InvitationInput(email))).StatusCode);
        Assert.Equal(1, provider.Calls);
    }

    [Fact]
    public async Task ConflictingIdentityNeverOverwritesTheTeacherProfile()
    {
        var teacherId = await database.AddTeacherAsync();
        var provider = new FakeProvider { Identity = teacherId };
        await using var application = Application(database, provider);
        using var client = await TeacherAsync(application);
        var id = await CreateStudentAsync(client);
        using var response = await client.PostAsJsonAsync($"/api/students/{id}/invitation", new InvitationInput($"conflict-{Guid.NewGuid():N}@example.test"));
        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        var session = await client.GetFromJsonAsync<JsonElement>("/api/session");
        Assert.Equal("teacher", session.GetProperty("role").GetString());
        var invitations = await client.GetFromJsonAsync<List<InvitationReceipt>>("/api/invitations");
        Assert.Contains(invitations!, invitation => invitation.StudentId == id && invitation.Status == "needs_review");
    }

    [Fact]
    public async Task ConcurrentRequestsSendOneInvitationAndCreateOneLink()
    {
        var provider = new FakeProvider();
        await using var application = Application(database, provider);
        using var client = await TeacherAsync(application);
        var id = await CreateStudentAsync(client);
        var input = new InvitationInput($"concurrent-{Guid.NewGuid():N}@example.test");
        var responses = await Task.WhenAll(client.PostAsJsonAsync($"/api/students/{id}/invitation", input), client.PostAsJsonAsync($"/api/students/{id}/invitation", input));
        Assert.Single(responses, response => response.StatusCode == HttpStatusCode.OK);
        Assert.Single(responses, response => response.StatusCode == HttpStatusCode.Conflict);
        Assert.Equal(1, provider.Calls);
        foreach (var response in responses) response.Dispose();
    }

    [Fact]
    public async Task InvalidEmailOrUnknownStudentDoesNotCallTheProvider()
    {
        var provider = new FakeProvider();
        await using var application = Application(database, provider);
        using var client = await TeacherAsync(application);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/students/missing/invitation", new InvitationInput("invalid"))).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsJsonAsync("/api/students/missing/invitation", new InvitationInput("unknown@example.test"))).StatusCode);
        Assert.Equal(0, provider.Calls);
    }

    private sealed class FakeProvider : IInvitationProvider
    {
        public bool IsConfigured => true;
        public Guid Identity { get; init; } = Guid.NewGuid();
        public bool Fail { get; init; }
        private int calls;
        public int Calls => calls;
        public Task<InvitedIdentity> SendAsync(string email, CancellationToken cancellationToken)
        {
            Interlocked.Increment(ref calls);
            if (Fail) throw new HttpRequestException("PRIVATE_PROVIDER_ERROR");
            return Task.FromResult(new InvitedIdentity(Identity, email));
        }
    }
}
