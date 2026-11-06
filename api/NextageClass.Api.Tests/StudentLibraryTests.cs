using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using NextageClass.Api.Catalog;
using NextageClass.Api.Scheduling;
using Npgsql;
using TestApplication = NextageClass.Api.Tests.AccountAccessTests.AccessApplication;

namespace NextageClass.Api.Tests;

[Collection("ApiDatabase")]
public sealed class StudentLibraryTests(AccessDatabase database)
{
    [Fact]
    public async Task LibraryUsesCurrentLevelAndOwnProgressWithoutWriting()
    {
        var (user, student) = await database.AddStudentAsync();
        var (otherUser, other) = await database.AddStudentAsync();
        await using var app = new TestApplication(database.Connection);
        using var teacher = app.CreateClient();
        teacher.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", app.Token((await database.AddTeacherAsync()).ToString()));
        using var client = app.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", app.Token(user.ToString()));
        using var second = app.CreateClient();
        second.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", app.Token(otherUser.ToString()));
        using var visitor = app.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await visitor.GetAsync("/api/student/library")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await teacher.GetAsync("/api/student/library")).StatusCode);
        var bookResponse = await teacher.PostAsJsonAsync("/api/books", new BookInput("D2 sequence", ["A1"]));
        bookResponse.EnsureSuccessStatusCode();
        var book = (await bookResponse.Content.ReadFromJsonAsync<BookData>())!; database.TrackBook(book.Id);
        await SetStudent(student, "A1", book.Id);
        var empty = await client.GetFromJsonAsync<StudentLibraryData>("/api/student/library");
        Assert.Equal("empty", empty!.Primary.Status);
        var units = new List<MaterialData>();
        for (var number = 1; number <= 2; number++)
        {
            var response = await teacher.PostAsJsonAsync("/api/materials", new MaterialInput($"D2 unit {number}", $"Original D2 {number}", book.Id, number));
            response.EnsureSuccessStatusCode();
            var unit = (await response.Content.ReadFromJsonAsync<MaterialData>())!; units.Add(unit); database.TrackMaterial(unit.Id);
        }
        var initial = await client.GetFromJsonAsync<StudentLibraryData>("/api/student/library");
        Assert.Equal(units[0].Id, initial!.Primary.CurrentItemId);
        var scheduled = await teacher.PostAsJsonAsync("/api/agenda/lessons", new ScheduleLessonInput(student, new(2024, 12, 2), 18, false, null));
        scheduled.EnsureSuccessStatusCode();
        var lesson = Assert.Single((await scheduled.Content.ReadFromJsonAsync<ScheduleData>())!.Lessons, x => x.StudentId == student);
        var saved = await teacher.PostAsJsonAsync("/api/lesson-records", new { lessonId = lesson.Id, attendance = "attended", content = "PRIVATE D2 NOTE", usedMaterialId = units[0].Id, courseCompleted = true, homework = "D2 homework" });
        saved.EnsureSuccessStatusCode();
        var record = Assert.Single((await saved.Content.ReadFromJsonAsync<List<LessonRecordData>>())!, x => x.LessonId == lesson.Id);
        var before = await teacher.GetStringAsync("/api/lesson-records");
        var own = await client.GetFromJsonAsync<StudentLibraryData>($"/api/student/library?studentId={other}");
        Assert.Equal(units[1].Id, own!.Primary.CurrentItemId);
        Assert.Equal("unassigned", (await second.GetFromJsonAsync<StudentLibraryData>("/api/student/library"))!.Primary.Status);
        Assert.Equal(before, await teacher.GetStringAsync("/api/lesson-records"));
        (await teacher.PostAsJsonAsync("/api/lesson-records", new { lessonId = lesson.Id, attendance = "attended", content = "PRIVATE D2 NOTE", usedMaterialId = units[1].Id, courseCompleted = true, homework = "D2 homework" })).EnsureSuccessStatusCode();
        Assert.Equal("finished", (await client.GetFromJsonAsync<StudentLibraryData>("/api/student/library"))!.Primary.Status);
        (await teacher.PutAsJsonAsync($"/api/materials/{units[1].Id}", new MaterialInput("D2 changed", "Edited D2 content", book.Id, 2))).EnsureSuccessStatusCode();
        await SetStudent(student, "A2", book.Id);
        var promoted = await client.GetFromJsonAsync<StudentLibraryData>("/api/student/library");
        Assert.Equal("unavailable", promoted!.Primary.Status);
        Assert.DoesNotContain(promoted.Materials, x => x.Id == units[0].Id || x.Id == units[1].Id);
        var history = await client.GetStringAsync("/api/student/overview");
        Assert.Contains("Original D2 2", history);
        Assert.DoesNotContain("PRIVATE D2 NOTE", history);
        Assert.Contains("D2 homework", history);
        Assert.Equal(record.Id, Assert.Single((await teacher.GetFromJsonAsync<List<LessonRecordData>>("/api/lesson-records"))!, x => x.LessonId == lesson.Id).Id);
    }

    private async Task SetStudent(string id, string level, string? book)
    {
        await using var source = NpgsqlDataSource.Create(database.Connection);
        await using var command = source.CreateCommand("UPDATE app.students SET level=$2,primary_book_id=$3 WHERE id=$1");
        command.Parameters.AddWithValue(id); command.Parameters.AddWithValue(level);
        command.Parameters.AddWithValue(NpgsqlTypes.NpgsqlDbType.Text, (object?)book ?? DBNull.Value);
        await command.ExecuteNonQueryAsync();
    }
}