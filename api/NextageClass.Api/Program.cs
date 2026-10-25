using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using NextageClass.Api.Access;
using NextageClass.Api.Infrastructure;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("NextageClass");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("Configure ConnectionStrings__NextageClass antes de iniciar a API.");
}

if (args.Contains("--migrate", StringComparer.Ordinal))
{
    await using var source = NpgsqlDataSource.Create(connectionString);
    await DatabaseMigrations.ApplyAsync(source);
    Console.WriteLine("Migrações aplicadas.");
    return;
}
builder.Services.AddSingleton(_ => NpgsqlDataSource.Create(connectionString));
builder.AddSupabaseAccess();
builder.Services.AddHealthChecks()
    .AddCheck<PostgresHealthCheck>("postgres", timeout: TimeSpan.FromSeconds(5));
builder.Services.AddProblemDetails();

var app = builder.Build();
app.UseExceptionHandler();
app.Use(async (context, next) =>
{
    context.Response.Headers.CacheControl = "no-store";
    await next();
});
app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/api/health/live", new HealthCheckOptions
{
    Predicate = _ => false,
    ResponseWriter = WriteHealthResponse
});
app.MapHealthChecks("/api/health/ready", new HealthCheckOptions
{
    ResponseWriter = WriteHealthResponse
});
app.MapGet("/api/session", async (CurrentAccess current) => Results.Ok(await current.GetAsync())).RequireAuthorization("Member");
app.Run();

static Task WriteHealthResponse(HttpContext context, HealthReport report) =>
    context.Response.WriteAsJsonAsync(new
    {
        status = report.Status == HealthStatus.Healthy ? "ready" : "unavailable"
    });

public partial class Program;
