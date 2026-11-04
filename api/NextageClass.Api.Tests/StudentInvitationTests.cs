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

    private static TestApplication Application(AccessDatabase database, IInvitationProvider provider) =>
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
    public async Task CreationResponseMatchesThePersistedStudentIncludingTimestampPrecision()
    {
        await using var application = Application(database, new FakeProvider());
        using var client = await TeacherAsync(application);
        using var response = await client.PostAsJsonAsync("/api/students", new StudentInput(" Creation response ", "A1", new DateOnly(2026, 11, 4)));
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<StudentData>();
        Assert.NotNull(created);
        database.TrackStudent(created.Id);
        var persisted = (await client.GetFromJsonAsync<List<StudentData>>("/api/students"))!.Single(item => item.Id == created.Id);
        Assert.Equal(created, persisted);
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

    [Fact]
    public async Task TeacherEditsStudentWithoutRecreatingTheInvitationOrAccess()
    {
        var provider = new FakeProvider();
        await using var application = Application(database, provider);
        using var client = await TeacherAsync(application);
        var id = await CreateStudentAsync(client);
        var before = (await client.GetFromJsonAsync<List<StudentData>>("/api/students"))!.Single(student => student.Id == id);
        using var invited = await client.PostAsJsonAsync($"/api/students/{id}/invitation", new InvitationInput($"editing-{Guid.NewGuid():N}@example.test"));
        Assert.Equal(HttpStatusCode.OK, invited.StatusCode);
        var receipt = await invited.Content.ReadFromJsonAsync<InvitationReceipt>();
        var input = new StudentInput(" Updated learner ", "B1", new DateOnly(2026, 11, 1), " 123 ", " Designer ", " Travel ", "https://example.test/lesson");
        using var response = await client.PutAsJsonAsync($"/api/students/{id}", input);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await response.Content.ReadFromJsonAsync<StudentData>();
        Assert.Equal(before.CreatedAt, updated!.CreatedAt);
        Assert.Equal(id, updated.Id);
        Assert.Equal("Updated learner", updated.Name);
        Assert.Equal("B1", updated.Level);
        Assert.Equal("123", updated.Phone);
        Assert.Equal("Designer", updated.Occupation);
        Assert.Equal("Travel", updated.Interests);
        Assert.Equal(input.StartDate, updated.StartDate);
        Assert.Equal(input.MeetingUrl, updated.MeetingUrl);
        Assert.Equal(updated, (await client.GetFromJsonAsync<List<StudentData>>("/api/students"))!.Single(student => student.Id == id));
        Assert.Equal(receipt, (await client.GetFromJsonAsync<List<InvitationReceipt>>("/api/invitations"))!.Single(item => item.StudentId == id));
        using var learner = application.CreateClient();
        learner.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", application.Token(provider.Identity.ToString()));
        var session = await learner.GetFromJsonAsync<JsonElement>("/api/session");
        Assert.Equal(id, session.GetProperty("studentId").GetString());
        Assert.Equal("student", session.GetProperty("role").GetString());
        Assert.Equal("Updated learner", session.GetProperty("displayName").GetString());
        Assert.Equal(1, provider.Calls);
    }

    [Fact]
    public async Task InvalidStudentEditPreservesStoredDataAndUnknownIdReturnsNotFound()
    {
        await using var application = Application(database, new FakeProvider());
        using var client = await TeacherAsync(application);
        var id = await CreateStudentAsync(client);
        var before = (await client.GetFromJsonAsync<List<StudentData>>("/api/students"))!.Single(student => student.Id == id);
        foreach (var input in new[] {
            new StudentInput("", "A1", before.StartDate),
            new StudentInput("Invalid", "A3", before.StartDate),
            new StudentInput("Invalid", "A1", before.StartDate, MeetingUrl: "javascript:alert(1)") })
            Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync($"/api/students/{id}", input)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync($"/api/students/{id}", new { name = "Missing date", level = "A1" })).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.PutAsJsonAsync("/api/students/missing", new StudentInput("Unknown", "A1", before.StartDate))).StatusCode);
        Assert.Equal(before, (await client.GetFromJsonAsync<List<StudentData>>("/api/students"))!.Single(student => student.Id == id));
    }

    [Fact]
    public async Task OnlyAnActiveTeacherCanEditStudents()
    {
        var provider = new FakeProvider();
        var (userId, studentId) = await database.AddStudentAsync();
        await using var application = Application(database, provider);
        using var teacher = await TeacherAsync(application);
        var before = (await teacher.GetFromJsonAsync<List<StudentData>>("/api/students"))!.Single(student => student.Id == studentId);
        using var client = application.CreateClient();
        var input = new StudentInput("Blocked edit", "A2", new DateOnly(2026, 10, 29));
        var path = $"/api/students/{Uri.EscapeDataString(studentId)}";
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PutAsJsonAsync(path, input)).StatusCode);
        foreach (var identity in new[] { userId, Guid.NewGuid() })
        {
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", application.Token(identity.ToString()));
            Assert.Equal(HttpStatusCode.Forbidden, (await client.PutAsJsonAsync(path, input)).StatusCode);
        }
        Assert.Equal(before, (await teacher.GetFromJsonAsync<List<StudentData>>("/api/students"))!.Single(student => student.Id == studentId));
        Assert.Equal(0, provider.Calls);
    }

    [Fact]
    public async Task EditWhileInvitationIsBeingDeliveredUsesTheLatestStudentName()
    {
        var provider = new DelayedProvider();
        await using var application = Application(database, provider);
        using var client = await TeacherAsync(application);
        var id = await CreateStudentAsync(client);
        var delivery = client.PostAsJsonAsync($"/api/students/{id}/invitation", new InvitationInput($"delayed-{Guid.NewGuid():N}@example.test"));
        try
        {
            await provider.Started.Task.WaitAsync(TimeSpan.FromSeconds(10));
            using var edited = await client.PutAsJsonAsync($"/api/students/{id}", new StudentInput("Name changed during delivery", "A2", new DateOnly(2026, 10, 29)));
            Assert.Equal(HttpStatusCode.OK, edited.StatusCode);
        }
        finally { provider.Release.TrySetResult(); }
        using var sent = await delivery;
        Assert.Equal(HttpStatusCode.OK, sent.StatusCode);
        using var learner = application.CreateClient();
        learner.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", application.Token(provider.Identity.ToString()));
        var session = await learner.GetFromJsonAsync<JsonElement>("/api/session");
        Assert.Equal("Name changed during delivery", session.GetProperty("displayName").GetString());
        Assert.Equal(id, session.GetProperty("studentId").GetString());
        Assert.Equal("student", session.GetProperty("role").GetString());
    }

    private sealed class DelayedProvider : IInvitationProvider
    {
        public bool IsConfigured => true;
        public Guid Identity { get; } = Guid.NewGuid();
        public TaskCompletionSource Started { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);
        public TaskCompletionSource Release { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);
        public async Task<InvitedIdentity> SendAsync(string email, CancellationToken cancellationToken)
        {
            Started.TrySetResult();
            await Release.Task.WaitAsync(cancellationToken);
            return new InvitedIdentity(Identity, email);
        }
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
