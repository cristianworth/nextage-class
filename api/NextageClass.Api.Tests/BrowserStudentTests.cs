using System.Diagnostics;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using NextageClass.Api.Catalog;
using NextageClass.Api.Scheduling;
using NextageClass.Api.Students;
using Npgsql;
using Xunit.Abstractions;
using TestApplication = NextageClass.Api.Tests.AccountAccessTests.AccessApplication;

namespace NextageClass.Api.Tests;

[Collection("ApiDatabase")]
public sealed class BrowserStudentTests(AccessDatabase database, ITestOutputHelper output)
{
    [Theory]
    [Trait("Category", "Browser")]
    [InlineData("desktop", 1440, 1000)]
    [InlineData("mobile", 390, 844)]
    public async Task BrowserPersistsStudentChangesThroughTheRealApi(string layout, int width, int height)
    {
        Assert.EndsWith("_tests", new NpgsqlConnectionStringBuilder(database.Connection).Database);
        var teacher = await database.AddTeacherAsync();
        var (student, studentId) = await database.AddStudentAsync();
        var (secondStudent, secondStudentId) = await database.AddStudentAsync();
        await using (var source = NpgsqlDataSource.Create(database.Connection))
        await using (var update = source.CreateCommand("UPDATE app.students SET name=$2,level=$3 WHERE id=$1"))
        { update.Parameters.AddWithValue(secondStudentId); update.Parameters.AddWithValue("Test student 2 " + layout); update.Parameters.AddWithValue("B1"); await update.ExecuteNonQueryAsync(); }
        await using var application = new TestApplication(database.Connection);
        application.UseKestrel(options => options.Listen(IPAddress.Loopback, 0));
        using var client = application.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", application.Token(teacher.ToString()));
        var root = Path.GetFullPath(Path.Combine(application.Services.GetRequiredService<IWebHostEnvironment>().ContentRootPath, "../.."));
        var marker = $"Lia Exemplo {Guid.NewGuid().ToString("N")[..8]}";
        var pastDate = new DateOnly(2025, 1, 6);
        var past = await client.PostAsJsonAsync("/api/agenda/lessons", new ScheduleLessonInput(studentId, pastDate, layout == "desktop" ? 21 : 22, false, null));
        past.EnsureSuccessStatusCode();
        var pastLesson = Assert.Single((await past.Content.ReadFromJsonAsync<ScheduleData>())!.Lessons, item => item.StudentId == studentId);
        var support = await client.PostAsJsonAsync("/api/materials", new MaterialInput("Student Shared " + layout + " " + Guid.NewGuid().ToString("N"), "Shared student text " + layout, Levels: ["A1"]));
        support.EnsureSuccessStatusCode();
        var supportMaterial = (await support.Content.ReadFromJsonAsync<MaterialData>())!;
        database.TrackMaterial(supportMaterial.Id);
        var entry = await client.PostAsJsonAsync("/api/lesson-records", new { lessonId = pastLesson.Id, attendance = "attended", content = "PRIVATE_STUDENT_NOTE", usedMaterialId = supportMaterial.Id, homework = marker + " homework" });
        entry.EnsureSuccessStatusCode();
        var future = await client.PostAsJsonAsync("/api/agenda/lessons", new ScheduleLessonInput(studentId, new DateOnly(2035, 1, 1), layout == "desktop" ? 7 : 8, false, null));
        future.EnsureSuccessStatusCode();
        var start = new ProcessStartInfo("node")
        {
            WorkingDirectory = Path.Combine(root, "web"),
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };
        start.ArgumentList.Add("e2e-connected/student-registration.mjs");
        start.Environment["NEXTAGE_BROWSER_API"] = client.BaseAddress!.ToString();
        start.Environment["NEXTAGE_BROWSER_TEACHER_TOKEN"] = application.Token(teacher.ToString());
        start.Environment["NEXTAGE_BROWSER_STUDENT_TOKEN"] = application.Token(student.ToString());
        start.Environment["NEXTAGE_BROWSER_SECOND_STUDENT_TOKEN"] = application.Token(secondStudent.ToString());
        start.Environment["NEXTAGE_BROWSER_NAME"] = marker;
        start.Environment["NEXTAGE_BROWSER_LAYOUT"] = layout;
        start.Environment["NEXTAGE_BROWSER_WIDTH"] = width.ToString();
        start.Environment["NEXTAGE_BROWSER_HEIGHT"] = height.ToString();
        start.Environment.Remove("NEXTAGE_TEST_CONNECTION");
        using var process = new Process { StartInfo = start };
        Assert.True(process.Start());
        var standardOutput = process.StandardOutput.ReadToEndAsync();
        var standardError = process.StandardError.ReadToEndAsync();
        try
        {
            using var timeout = new CancellationTokenSource(TimeSpan.FromMinutes(3));
            await process.WaitForExitAsync(timeout.Token);
            var browserOutput = await standardOutput;
            var browserError = await standardError;
            output.WriteLine(browserOutput);
            Assert.True(process.ExitCode == 0, $"Browser failed ({layout}): {browserOutput}\n{browserError}");

            var saved = Assert.Single((await client.GetFromJsonAsync<List<StudentData>>("/api/students"))!, item => item.Name == marker + " editado");
            await using var source = NpgsqlDataSource.Create(database.Connection);
            await using var command = source.CreateCommand("SELECT name, level, start_date, phone, occupation, interests, meeting_url FROM app.students WHERE id=$1");
            command.Parameters.AddWithValue(saved.Id);
            await using var reader = await command.ExecuteReaderAsync();
            Assert.True(await reader.ReadAsync());
            Assert.Equal(marker + " editado", reader.GetString(0));
            Assert.Equal("B1", reader.GetString(1));
            Assert.Equal(new DateOnly(2026, 11, 4), reader.GetFieldValue<DateOnly>(2));
            Assert.Equal("(11) 3456-7890", reader.GetString(3));
            Assert.Equal("Dados fictícios", reader.GetString(4));
            Assert.Equal("Conversação", reader.GetString(5));
            Assert.Equal("https://example.test/aula", reader.GetString(6));
            Assert.NotNull(saved.PrimaryBookId);
        }
        finally
        {
            if (!process.HasExited)
            {
                process.Kill(entireProcessTree: true);
                await process.WaitForExitAsync();
            }
            // Track rows even when a browser assertion fails after creation.
            foreach (var person in (await client.GetFromJsonAsync<List<StudentData>>("/api/students"))!.Where(item => item.Name.StartsWith(marker, StringComparison.Ordinal)))
                database.TrackStudent(person.Id);
            var catalog = (await client.GetFromJsonAsync<CatalogData>("/api/catalog"))!;
            foreach (var book in catalog.Books.Where(item => item.Title.StartsWith(marker, StringComparison.Ordinal))) database.TrackBook(book.Id);
            foreach (var material in catalog.Materials.Where(item => item.Title.StartsWith(marker, StringComparison.Ordinal))) database.TrackMaterial(material.Id);
            var agenda = (await client.GetFromJsonAsync<ScheduleData>("/api/agenda"))!;
            foreach (var block in agenda.Blocks.Where(item => item.Title.StartsWith(marker, StringComparison.Ordinal))) database.TrackScheduleBlock(block.Id);
        }
    }
}
