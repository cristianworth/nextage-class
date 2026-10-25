using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using NextageClass.Api.Access;
using NextageClass.Api.Invitations;
using NextageClass.Api.Infrastructure;
using NextageClass.Api.Students;
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
builder.Services.AddExceptionHandler<ApiFailureHandler>();
builder.Services.AddScoped<StudentStore>();
builder.Services.AddScoped<StudentInvitationService>();
builder.Services.AddSingleton<IInvitationProvider, SupabaseInvitationProvider>();

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
var students = app.MapGroup("/api/students").RequireAuthorization("Teacher");
students.MapGet("", async (StudentStore store, CancellationToken cancellationToken) => await store.ListAsync(cancellationToken));
students.MapPost("", async (StudentInput input, StudentStore store, CancellationToken cancellationToken) =>
{
    var student = await store.CreateAsync(input, cancellationToken);
    return Results.Created($"/api/students/{student.Id}", student);
});
students.MapPost("/{studentId}/invitation", async (string studentId, InvitationInput input, StudentInvitationService service, CancellationToken cancellationToken) =>
    Results.Ok(await service.InviteAsync(studentId, input, cancellationToken)));
app.MapGet("/api/invitations", async (StudentInvitationService service, CancellationToken cancellationToken) => await service.ListAsync(cancellationToken)).RequireAuthorization("Teacher");
app.Run();

static Task WriteHealthResponse(HttpContext context, HealthReport report) =>
    context.Response.WriteAsJsonAsync(new
    {
        status = report.Status == HealthStatus.Healthy ? "ready" : "unavailable"
    });

public partial class Program;
