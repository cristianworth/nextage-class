using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using NextageClass.Api.Infrastructure;
using Npgsql;

namespace NextageClass.Api.Tests;

public sealed class AccessDatabase : IAsyncLifetime
{
    public string Connection { get; } = Environment.GetEnvironmentVariable("NEXTAGE_TEST_CONNECTION")
        ?? throw new InvalidOperationException("Defina NEXTAGE_TEST_CONNECTION para os testes com PostgreSQL real.");
    private readonly List<Guid> users = [];
    private readonly List<string> students = [];

    public async Task InitializeAsync()
    {
        await using var source = NpgsqlDataSource.Create(Connection);
        await DatabaseMigrations.ApplyAsync(source);
        await DatabaseMigrations.ApplyAsync(source);
    }

    public async Task<(Guid UserId, string StudentId)> AddStudentAsync(bool active = true)
    {
        var userId = Guid.NewGuid();
        var studentId = "test-student/" + Guid.NewGuid();
        await using var source = NpgsqlDataSource.Create(Connection);
        await using var batch = source.CreateBatch();
        var student = new NpgsqlBatchCommand("INSERT INTO app.students(id, name, level, start_date) VALUES ($1, 'Test student', 'A1', DATE '2026-10-25')");
        student.Parameters.AddWithValue(studentId);
        var profile = new NpgsqlBatchCommand("INSERT INTO app.access_profiles(user_id, role, student_id, display_name, active) VALUES ($1, 'student', $2, 'Authorized student', $3)");
        profile.Parameters.AddWithValue(userId);
        profile.Parameters.AddWithValue(studentId);
        profile.Parameters.AddWithValue(active);
        batch.BatchCommands.Add(student);
        batch.BatchCommands.Add(profile);
        await batch.ExecuteNonQueryAsync();
        users.Add(userId); students.Add(studentId);
        return (userId, studentId);
    }

    public async Task DisposeAsync()
    {
        await using var source = NpgsqlDataSource.Create(Connection);
        await using var batch = source.CreateBatch();
        var profiles = new NpgsqlBatchCommand("DELETE FROM app.access_profiles WHERE user_id = ANY($1)");
        profiles.Parameters.AddWithValue(users.ToArray());
        var registrations = new NpgsqlBatchCommand("DELETE FROM app.students WHERE id = ANY($1)");
        registrations.Parameters.AddWithValue(students.ToArray());
        batch.BatchCommands.Add(profiles);
        batch.BatchCommands.Add(registrations);
        await batch.ExecuteNonQueryAsync();
    }
}

public sealed class AccountAccessTests(AccessDatabase database) : IClassFixture<AccessDatabase>
{
    private const string Issuer = "https://test-project.supabase.co/auth/v1";

    [Fact]
    public async Task MissingTokenIsUnauthorized()
    {
        await using var application = new AccessApplication(database.Connection);
        using var client = application.CreateClient();
        using var response = await client.GetAsync("/api/session");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.True(response.Headers.CacheControl?.NoStore);
    }

    [Theory]
    [InlineData("signature")]
    [InlineData("issuer")]
    [InlineData("audience")]
    [InlineData("expired")]
    public async Task InvalidTokenCannotReachTheSession(string invalid)
    {
        var (id, _) = await database.AddStudentAsync();
        await using var application = new AccessApplication(database.Connection);
        using var client = application.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", application.Token(id.ToString(), invalid));
        using var response = await client.GetAsync("/api/session");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Empty(await response.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task SignedTokenDoesNotGrantAccessWithoutAnActiveProfile()
    {
        var (inactive, _) = await database.AddStudentAsync(false);
        await using var application = new AccessApplication(database.Connection);
        using var client = application.CreateClient();
        foreach (var id in new[] { inactive.ToString(), Guid.NewGuid().ToString(), "not-a-user-id" })
        {
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", application.Token(id));
            using var response = await client.GetAsync("/api/session");
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }
    }

    [Fact]
    public async Task SessionUsesTheStoredRoleAndStudentInsteadOfEditableClaims()
    {
        var (id, studentId) = await database.AddStudentAsync();
        await using var application = new AccessApplication(database.Connection);
        using var client = application.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", application.Token(id.ToString()));
        using var response = await client.GetAsync("/api/session");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var session = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("student", session.GetProperty("role").GetString());
        Assert.Equal(studentId, session.GetProperty("studentId").GetString());
        Assert.Equal("Authorized student", session.GetProperty("displayName").GetString());
        Assert.DoesNotContain("OTHER_STUDENT", await response.Content.ReadAsStringAsync());
    }

    private sealed class AccessApplication : WebApplicationFactory<Program>
    {
        private readonly string connection;
        private readonly ECDsa privateKey = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        private readonly ECDsaSecurityKey signingKey;

        public AccessApplication(string connection)
        {
            this.connection = connection;
            signingKey = new ECDsaSecurityKey(privateKey) { KeyId = Guid.NewGuid().ToString() };
        }

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing")
                .UseSetting("Supabase:Url", "https://test-project.supabase.co")
                .UseSetting("ConnectionStrings:NextageClass", connection);
            builder.ConfigureServices(services => services.PostConfigure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
            {
                var configuration = new OpenIdConnectConfiguration { Issuer = Issuer };
                configuration.SigningKeys.Add(new ECDsaSecurityKey(ECDsa.Create(privateKey.ExportParameters(false))) { KeyId = signingKey.KeyId });
                options.ConfigurationManager = new StaticConfigurationManager<OpenIdConnectConfiguration>(configuration);
            }));
        }

        public string Token(string id, string? invalid = null)
        {
            using var different = ECDsa.Create(ECCurve.NamedCurves.nistP256);
            var credentials = new SigningCredentials(invalid == "signature" ? new ECDsaSecurityKey(different) { KeyId = signingKey.KeyId } : signingKey, SecurityAlgorithms.EcdsaSha256);
            var token = new JwtSecurityToken(
                invalid == "issuer" ? "https://other-project.supabase.co/auth/v1" : Issuer,
                invalid == "audience" ? "another-audience" : "authenticated",
                [new Claim("sub", id), new Claim("role", "teacher"), new Claim("user_metadata", "{\"role\":\"teacher\",\"studentId\":\"OTHER_STUDENT\"}")],
                DateTime.UtcNow.AddHours(-1), invalid == "expired" ? DateTime.UtcNow.AddMinutes(-10) : DateTime.UtcNow.AddMinutes(10), credentials);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);
            if (disposing) privateKey.Dispose();
        }
    }
}
