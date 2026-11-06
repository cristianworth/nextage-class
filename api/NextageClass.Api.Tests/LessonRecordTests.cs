using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using NextageClass.Api.Catalog;
using NextageClass.Api.Scheduling;
using Npgsql;
using TestApplication = NextageClass.Api.Tests.AccountAccessTests.AccessApplication;

namespace NextageClass.Api.Tests;

[Collection("ApiDatabase")]
public sealed class LessonRecordTests(AccessDatabase database)
{
    [Fact]
    public async Task ConcurrentSavesKeepOneRecordAndInvalidInputDoesNotMaterialize()
    {
        var (_, student) = await database.AddStudentAsync();
        var clock = new TestClock { Now = new(2026, 11, 5, 15, 0, 0, TimeSpan.Zero) };
        await using var app = new TestApplication(database.Connection, services => services.AddSingleton<TimeProvider>(clock));
        using var client = app.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", app.Token((await database.AddTeacherAsync()).ToString()));
        var created = await client.PostAsJsonAsync("/api/agenda/lessons", new ScheduleLessonInput(student, new(2026, 11, 2), 8, true, new(2026, 11, 16)));
        created.EnsureSuccessStatusCode();
        var series = Assert.Single((await created.Content.ReadFromJsonAsync<ScheduleData>())!.Series, item => item.StudentId == student);
        var id = $"weekly/{series.Id}/0";
        var invalid = await client.PostAsJsonAsync("/api/lesson-records", new { lessonId = id, attendance = "attended", content = " ", reason = "" });
        Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);
        Assert.DoesNotContain((await client.GetFromJsonAsync<ScheduleData>("/api/agenda"))!.Lessons, item => item.Id == id);
        var command = new { lessonId = id, attendance = "student-absent", content = "", reason = "" };
        var results = await Task.WhenAll(client.PostAsJsonAsync("/api/lesson-records", command), client.PostAsJsonAsync("/api/lesson-records", command));
        Assert.All(results, response => response.EnsureSuccessStatusCode());
        var history = (await client.GetFromJsonAsync<List<LessonRecordData>>("/api/lesson-records"))!;
        Assert.Single(history, item => item.LessonId == id);
        Assert.Single((await client.GetFromJsonAsync<ScheduleData>("/api/agenda"))!.Lessons, item => item.Id == id);
    }

    [Fact]
    public async Task MovedWeeklyLessonAndSnapshotSurviveEditsAndFollowingSeriesChange()
    {
        var (user, student) = await database.AddStudentAsync();
        var clock = new TestClock { Now = new(2026, 10, 1, 12, 0, 0, TimeSpan.Zero) };
        await using var app = new TestApplication(database.Connection, services => services.AddSingleton<TimeProvider>(clock));
        using var client = app.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", app.Token((await database.AddTeacherAsync()).ToString()));
        using var denied = app.CreateClient();
        denied.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", app.Token(user.ToString()));
        Assert.Equal(HttpStatusCode.Forbidden, (await denied.GetAsync("/api/lesson-records")).StatusCode);
        var start = new DateOnly(2026, 10, 5);
        var scheduleResponse = await client.PostAsJsonAsync("/api/agenda/lessons", new ScheduleLessonInput(student, start, 10, true, null));
        scheduleResponse.EnsureSuccessStatusCode();
        var schedule = (await scheduleResponse.Content.ReadFromJsonAsync<ScheduleData>())!;
        var series = Assert.Single(schedule.Series, item => item.StudentId == student);
        var id = $"weekly/{series.Id}/0";
        var moved = new DateOnly(2026, 10, 6);
        (await client.PostAsJsonAsync("/api/agenda/reschedules", new RescheduleInput(id, start, 10, moved, 11, "single"))).EnsureSuccessStatusCode();
        var bookResponse = await client.PostAsJsonAsync("/api/books", new BookInput("Original book", ["A1"]));
        bookResponse.EnsureSuccessStatusCode();
        var book = (await bookResponse.Content.ReadFromJsonAsync<BookData>())!;
        database.TrackBook(book.Id);
        var materialResponse = await client.PostAsJsonAsync("/api/materials", new MaterialInput("Original unit", "Original text", book.Id, 1));
        materialResponse.EnsureSuccessStatusCode();
        var material = (await materialResponse.Content.ReadFromJsonAsync<MaterialData>())!;
        database.TrackMaterial(material.Id);
        var input = new { lessonId = id, attendance = "attended", content = "Studied", reason = "", usedMaterialId = material.Id };
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/lesson-records", input)).StatusCode);
        clock.Now = new(2026, 10, 6, 14, 54, 0, TimeSpan.Zero);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/lesson-records", input)).StatusCode);
        clock.Now = clock.Now.AddMinutes(1);
        var saved = await client.PostAsJsonAsync("/api/lesson-records", input);
        saved.EnsureSuccessStatusCode();
        var original = Assert.Single((await saved.Content.ReadFromJsonAsync<List<LessonRecordData>>())!, item => item.LessonId == id);
        Assert.Equal(moved, original.Lesson.Date);
        Assert.Equal(11, original.Lesson.Hour);
        Assert.Equal("Original book", original.MaterialSnapshot!.Value.GetProperty("bookTitle").GetString());
        await using (var source = NpgsqlDataSource.Create(database.Connection))
        await using (var change = source.CreateCommand("UPDATE app.students SET name='Changed',level='A2' WHERE id=$1"))
        {
            change.Parameters.AddWithValue(student);
            await change.ExecuteNonQueryAsync();
            await using var changeMaterial = source.CreateCommand("UPDATE app.materials SET content='Changed text' WHERE id=$1");
            changeMaterial.Parameters.AddWithValue(material.Id);
            await changeMaterial.ExecuteNonQueryAsync();
            await using var changeBook = source.CreateCommand("UPDATE app.books SET title='Changed book' WHERE id=$1");
            changeBook.Parameters.AddWithValue(book.Id);
            await changeBook.ExecuteNonQueryAsync();
        }
        var edit = await client.PostAsJsonAsync("/api/lesson-records", new { lessonId = id, attendance = "attended", content = "Corrected", reason = "" });
        edit.EnsureSuccessStatusCode();
        var edited = Assert.Single((await edit.Content.ReadFromJsonAsync<List<LessonRecordData>>())!, item => item.LessonId == id);
        Assert.Equal(original.Id, edited.Id);
        Assert.Equal(original.CreatedAt, edited.CreatedAt);
        Assert.Equal("A1", edited.Level);
        Assert.Equal("Test student", edited.StudentName);
        Assert.Equal("Original text", edited.MaterialSnapshot!.Value.GetProperty("content").GetString());
        Assert.Equal("Original book", edited.MaterialSnapshot.Value.GetProperty("bookTitle").GetString());
        var otherResponse = await client.PostAsJsonAsync("/api/materials", new MaterialInput("A2 support", "Other text", Levels: ["A2"]));
        otherResponse.EnsureSuccessStatusCode();
        var other = (await otherResponse.Content.ReadFromJsonAsync<MaterialData>())!;
        database.TrackMaterial(other.Id);
        var incompatible = await client.PostAsJsonAsync("/api/lesson-records", new { lessonId = id, attendance = "attended", content = "Corrected", reason = "", usedMaterialId = other.Id });
        Assert.Equal(HttpStatusCode.BadRequest, incompatible.StatusCode);
        var changedSelection = await client.PostAsJsonAsync("/api/lesson-records", new { lessonId = id, attendance = "attended", content = "Corrected", reason = "", usedMaterialId = material.Id });
        changedSelection.EnsureSuccessStatusCode();
        var replaced = Assert.Single((await changedSelection.Content.ReadFromJsonAsync<List<LessonRecordData>>())!, item => item.LessonId == id);
        Assert.Equal("Changed text", replaced.MaterialSnapshot!.Value.GetProperty("content").GetString());
        var following = new RescheduleInput($"weekly/{series.Id}/1", start.AddDays(7), 10, start.AddDays(8), 12, "following");
        (await client.PostAsJsonAsync("/api/agenda/reschedules", following)).EnsureSuccessStatusCode();
        var history = (await client.GetFromJsonAsync<List<LessonRecordData>>("/api/lesson-records"))!;
        var reloaded = Assert.Single(history, item => item.LessonId == id);
        Assert.Equal(edited.Id, reloaded.Id);
        Assert.Equal(edited.Lesson, reloaded.Lesson);
        Assert.Equal("Changed text", reloaded.MaterialSnapshot!.Value.GetProperty("content").GetString());
        var remove = await client.PostAsJsonAsync("/api/lesson-records", new { lessonId = id, attendance = "student-absent", content = "", reason = "", usedMaterialId = (string?)null });
        remove.EnsureSuccessStatusCode();
        Assert.Null(Assert.Single((await remove.Content.ReadFromJsonAsync<List<LessonRecordData>>())!, item => item.LessonId == id).MaterialSnapshot);
    }

    private sealed class TestClock : TimeProvider
    {
        public DateTimeOffset Now { get; set; }
        public override DateTimeOffset GetUtcNow() => Now;
    }
}
