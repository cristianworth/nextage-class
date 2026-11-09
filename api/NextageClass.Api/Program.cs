using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using NextageClass.Api.Access;
using NextageClass.Api.Catalog;
using NextageClass.Api.Invitations;
using NextageClass.Api.Infrastructure;
using NextageClass.Api.Scheduling;
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
builder.Services.AddScoped<CatalogStore>();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<ScheduleStore>();
builder.Services.AddScoped<LessonRecordStore>();
builder.Services.AddScoped<LessonPlanStore>();
builder.Services.AddScoped<StudentOverviewStore>();
builder.Services.AddScoped<StudentRequestStore>();
builder.Services.AddScoped<TeacherRequestStore>();
builder.Services.AddScoped<StudentLibraryStore>();
builder.Services.AddScoped<StudentInvitationService>();
builder.Services.AddSingleton<IInvitationProvider, SupabaseInvitationProvider>();

var app = builder.Build();
app.UseExceptionHandler();
app.Use(async (context, next) =>
{
    context.Response.Headers.CacheControl = "no-store";
    await next();
});
if (Directory.Exists(app.Environment.WebRootPath))
    app.UseStaticFiles();
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
app.MapGet("/api/student/overview", async (CurrentAccess current, StudentOverviewStore store, CancellationToken cancellationToken) =>
    await store.ReadAsync((await current.GetAsync())?.StudentId, cancellationToken)).RequireAuthorization("Student");
app.MapGet("/api/student/library", async (CurrentAccess current, StudentLibraryStore store, CancellationToken cancellationToken) =>
    await store.ReadAsync((await current.GetAsync())?.StudentId, cancellationToken)).RequireAuthorization("Student");
var studentRequests = app.MapGroup("/api/student/requests").RequireAuthorization("Student");
studentRequests.MapGet("", async (CurrentAccess current, StudentRequestStore store, CancellationToken ct) => await store.ListAsync((await current.GetAsync())?.StudentId, ct));
studentRequests.MapGet("/availability", async (string kind, DateOnly date, DateOnly? endDate, CurrentAccess current, StudentRequestStore store, CancellationToken ct) => await store.AvailableAsync((await current.GetAsync())?.StudentId, kind, date, endDate, ct));
studentRequests.MapPost("", async (StudentRequestInput input, CurrentAccess current, StudentRequestStore store, CancellationToken ct) => await store.SubmitAsync((await current.GetAsync())?.StudentId, input, ct));
var teacherRequests = app.MapGroup("/api/teacher/requests").RequireAuthorization("Teacher");
teacherRequests.MapGet("", (TeacherRequestStore store, CancellationToken ct) => store.ListAsync(ct));
teacherRequests.MapPost("/{id}/decision", (string id, RequestDecisionInput input, TeacherRequestStore store, CancellationToken ct) => store.DecideAsync(id, input.Decision, ct));
var agenda = app.MapGroup("/api/agenda").RequireAuthorization("Teacher");
agenda.MapGet("", (ScheduleStore store, CancellationToken cancellationToken) => store.ReadAsync(cancellationToken));
agenda.MapPost("/lessons", (ScheduleLessonInput input, ScheduleStore store, CancellationToken cancellationToken) => store.AddLessonAsync(input, cancellationToken));
agenda.MapPost("/blocks", (ScheduleBlockInput input, ScheduleStore store, CancellationToken cancellationToken) => store.AddBlockAsync(input, cancellationToken));
agenda.MapDelete("/blocks/{id}", (string id, ScheduleStore store, CancellationToken cancellationToken) => store.RemoveBlockAsync(id, cancellationToken));
agenda.MapPost("/reschedules", (RescheduleInput input, ScheduleStore store, CancellationToken cancellationToken) => store.RescheduleAsync(input, cancellationToken));
var records = app.MapGroup("/api/lesson-records").RequireAuthorization("Teacher");
records.MapGet("", (LessonRecordStore store, CancellationToken cancellationToken) => store.ReadAsync(cancellationToken));
records.MapPost("", (LessonRecordInput input, LessonRecordStore store, CancellationToken cancellationToken) => store.SaveAsync(input, cancellationToken));
records.MapPost("/homework", (HomeworkCorrectionInput input, LessonRecordStore store, CancellationToken cancellationToken) => store.CorrectHomeworkAsync(input, cancellationToken));
var plans = app.MapGroup("/api/lesson-plans").RequireAuthorization("Teacher");
plans.MapGet("", (LessonPlanStore store, CancellationToken cancellationToken) => store.ReadAsync(cancellationToken));
plans.MapPost("", (LessonPlanInput input, LessonPlanStore store, CancellationToken cancellationToken) => store.SaveAsync(input, cancellationToken));
var catalog = app.MapGroup("/api").RequireAuthorization("Teacher");
catalog.MapGet("/catalog", async (CatalogStore store, CancellationToken cancellationToken) => await store.ReadAsync(cancellationToken));
catalog.MapGet("/books", async (CatalogStore store, CancellationToken cancellationToken) => await store.ListBooksAsync(cancellationToken));
catalog.MapPost("/books", async (BookInput input, CatalogStore store, CancellationToken cancellationToken) =>
{
    var book = await store.SaveBookAsync(input, null, cancellationToken);
    return Results.Created($"/api/books/{book.Id}", book);
});
catalog.MapPut("/books/{bookId}", async (string bookId, BookInput input, CatalogStore store, CancellationToken cancellationToken) =>
    Results.Ok(await store.SaveBookAsync(input, bookId, cancellationToken)));
catalog.MapPost("/materials", async (MaterialInput input, CatalogStore store, CancellationToken cancellationToken) =>
{
    var material = await store.SaveMaterialAsync(input, null, cancellationToken);
    return Results.Created($"/api/materials/{material.Id}", material);
});
catalog.MapPut("/materials/{materialId}", async (string materialId, MaterialInput input, CatalogStore store, CancellationToken cancellationToken) =>
    Results.Ok(await store.SaveMaterialAsync(input, materialId, cancellationToken)));
var students = app.MapGroup("/api/students").RequireAuthorization("Teacher");
students.MapGet("", async (StudentStore store, CancellationToken cancellationToken) => await store.ListAsync(cancellationToken));
students.MapPost("", async (StudentInput input, StudentStore store, CancellationToken cancellationToken) =>
{
    var student = await store.CreateAsync(input, cancellationToken);
    return Results.Created($"/api/students/{student.Id}", student);
});
students.MapPut("/{studentId}", async (string studentId, StudentInput input, StudentStore store, CancellationToken cancellationToken) =>
    Results.Ok(await store.UpdateAsync(studentId, input, cancellationToken)));
students.MapPost("/{studentId}/invitation", async (string studentId, InvitationInput input, StudentInvitationService service, CancellationToken cancellationToken) =>
    Results.Ok(await service.InviteAsync(studentId, input, cancellationToken)));
app.MapGet("/api/invitations", async (StudentInvitationService service, CancellationToken cancellationToken) => await service.ListAsync(cancellationToken)).RequireAuthorization("Teacher");
app.MapFallback(async context =>
{
    if (context.Request.Path.StartsWithSegments("/api") ||
        !(HttpMethods.IsGet(context.Request.Method) || HttpMethods.IsHead(context.Request.Method)))
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        return;
    }

    var index = Path.Combine(app.Environment.WebRootPath, "index.html");
    if (!File.Exists(index))
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        return;
    }

    context.Response.ContentType = "text/html; charset=utf-8";
    await context.Response.SendFileAsync(index);
});
app.Run();

static Task WriteHealthResponse(HttpContext context, HealthReport report) =>
    context.Response.WriteAsJsonAsync(new
    {
        status = report.Status == HealthStatus.Healthy ? "ready" : "unavailable"
    });

public partial class Program;
