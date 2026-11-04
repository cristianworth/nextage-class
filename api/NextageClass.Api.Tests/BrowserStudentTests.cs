using System.Diagnostics;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
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
        var (student, _) = await database.AddStudentAsync();
        await using var application = new TestApplication(database.Connection);
        application.UseKestrel(options => options.Listen(IPAddress.Loopback, 0));
        using var client = application.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", application.Token(teacher.ToString()));
        var root = Path.GetFullPath(Path.Combine(application.Services.GetRequiredService<IWebHostEnvironment>().ContentRootPath, "../.."));
        var marker = $"Aluno de integração {Guid.NewGuid():N}";
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
            using var timeout = new CancellationTokenSource(TimeSpan.FromMinutes(2));
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
        }
    }
}
