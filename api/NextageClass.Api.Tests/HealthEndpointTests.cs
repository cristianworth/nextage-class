using System.Net;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace NextageClass.Api.Tests;

public sealed class HealthEndpointTests
{
    private const string UnavailableConnection = "Host=127.0.0.1;Port=1;Database=private_database;Username=private_user;Password=private_password;Timeout=1";

    [Fact]
    public async Task LivenessDoesNotRequireTheDatabase()
    {
        await using var application = new TestApplication(UnavailableConnection);
        using var client = application.CreateClient();
        using var response = await client.GetAsync("/api/health/live");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("{\"status\":\"ready\"}", await response.Content.ReadAsStringAsync());
        Assert.True(response.Headers.CacheControl?.NoStore);
    }

    [Fact]
    public async Task ReadinessReportsFailureWithoutConnectionDetails()
    {
        await using var application = new TestApplication(UnavailableConnection);
        using var client = application.CreateClient();
        using var response = await client.GetAsync("/api/health/ready");
        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Equal("{\"status\":\"unavailable\"}", await response.Content.ReadAsStringAsync());
        Assert.True(response.Headers.CacheControl?.NoStore);
    }

    [Fact]
    public async Task ReadinessQueriesTheConfiguredPostgresDatabase()
    {
        var connection = Environment.GetEnvironmentVariable("NEXTAGE_TEST_CONNECTION")
            ?? throw new InvalidOperationException("Defina NEXTAGE_TEST_CONNECTION para executar os testes com PostgreSQL real.");
        await using var application = new TestApplication(connection);
        using var client = application.CreateClient();
        using var response = await client.GetAsync("/api/health/ready");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("{\"status\":\"ready\"}", await response.Content.ReadAsStringAsync());
    }

    [Fact]
    public void MissingConnectionFailsBeforeServingRequests()
    {
        using var application = new TestApplication("");
        var exception = Assert.Throws<InvalidOperationException>(() => application.CreateClient());
        Assert.Contains("ConnectionStrings__NextageClass", exception.Message);
    }

    private sealed class TestApplication(string connection) : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder) =>
            builder.UseEnvironment("Testing")
                .UseSetting("Supabase:Url", "https://test-project.supabase.co")
                .UseSetting("ConnectionStrings:NextageClass", connection);
    }
}
