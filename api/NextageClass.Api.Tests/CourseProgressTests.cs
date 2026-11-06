using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using NextageClass.Api.Catalog;
using NextageClass.Api.Scheduling;
using TestApplication = NextageClass.Api.Tests.AccountAccessTests.AccessApplication;

namespace NextageClass.Api.Tests;

[Collection("ApiDatabase")]
public sealed class CourseProgressTests(AccessDatabase database)
{
    [Fact]
    public async Task RecordsPreserveWorkedUnitAndContinuityAcrossEditsAndHomework()
    {
        var (_, student) = await database.AddStudentAsync();
        await using var app = new TestApplication(database.Connection, services => services.AddSingleton<TimeProvider>(new FixedClock()));
        using var client = app.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", app.Token((await database.AddTeacherAsync()).ToString()));
        var bookResponse = await client.PostAsJsonAsync("/api/books", new BookInput("Livro de teste", ["A1", "A2"]));
        bookResponse.EnsureSuccessStatusCode();
        var book = (await bookResponse.Content.ReadFromJsonAsync<BookData>())!;
        database.TrackBook(book.Id);
        var units = new List<MaterialData>();
        for (var number = 1; number <= 3; number++)
        {
            var response = await client.PostAsJsonAsync("/api/materials", new MaterialInput($"Unidade {number}", $"Conteúdo {number}", book.Id, number));
            response.EnsureSuccessStatusCode();
            var unit = (await response.Content.ReadFromJsonAsync<MaterialData>())!;
            units.Add(unit); database.TrackMaterial(unit.Id);
        }
        var scheduled = await client.PostAsJsonAsync("/api/agenda/lessons", new ScheduleLessonInput(student, new(2026, 10, 5), 21, false, null));
        scheduled.EnsureSuccessStatusCode();
        var lesson = Assert.Single((await scheduled.Content.ReadFromJsonAsync<ScheduleData>())!.Lessons, item => item.StudentId == student);
        var initial = await client.PostAsJsonAsync("/api/lesson-records", new { lessonId = lesson.Id, attendance = "attended", content = "Concluído", usedMaterialId = units[1].Id, courseCompleted = true, homework = "Praticar" });
        initial.EnsureSuccessStatusCode();
        var record = Assert.Single((await initial.Content.ReadFromJsonAsync<List<LessonRecordData>>())!, item => item.LessonId == lesson.Id);
        Assert.Equal(2, record.MaterialSnapshot!.Value.GetProperty("lessonNumber").GetInt32());
        Assert.True(record.CourseProgress!.Completed);
        Assert.Equal(units[2].Id, record.CourseProgress.Next!.Value.GetProperty("id").GetString());
        var renamed = await client.PutAsJsonAsync($"/api/materials/{units[2].Id}", new MaterialInput("Renomeada", "Conteúdo alterado", book.Id, 3));
        renamed.EnsureSuccessStatusCode();
        var correction = await client.PostAsJsonAsync("/api/lesson-records/homework", new HomeworkCorrectionInput(record.Id, true, "Praticar"));
        correction.EnsureSuccessStatusCode();
        var edit = await client.PostAsJsonAsync("/api/lesson-records", new { lessonId = lesson.Id, attendance = "attended", content = "Corrigido", homework = "Praticar" });
        edit.EnsureSuccessStatusCode();
        var preserved = Assert.Single((await edit.Content.ReadFromJsonAsync<List<LessonRecordData>>())!, item => item.Id == record.Id);
        Assert.True(preserved.CourseProgress!.Completed);
        Assert.Equal(units[2].Id, preserved.CourseProgress.Next!.Value.GetProperty("id").GetString());
        Assert.Equal("Unidade 3", preserved.CourseProgress.Next.Value.GetProperty("title").GetString());
        Assert.NotNull(preserved.Homework!.CorrectedAt);
        var changed = await client.PostAsJsonAsync("/api/lesson-records", new { lessonId = lesson.Id, attendance = "attended", content = "Retomada", usedMaterialId = units[0].Id, courseCompleted = false });
        changed.EnsureSuccessStatusCode();
        var ongoing = Assert.Single((await changed.Content.ReadFromJsonAsync<List<LessonRecordData>>())!, item => item.Id == record.Id);
        Assert.False(ongoing.CourseProgress!.Completed);
        Assert.Equal(units[0].Id, ongoing.CourseProgress.Next!.Value.GetProperty("id").GetString());
        var absence = await client.PostAsJsonAsync("/api/lesson-records", new { lessonId = lesson.Id, attendance = "student-absent", content = "" });
        absence.EnsureSuccessStatusCode();
        Assert.Null(Assert.Single((await absence.Content.ReadFromJsonAsync<List<LessonRecordData>>())!, item => item.Id == record.Id).CourseProgress);
        var invalid = await client.PostAsJsonAsync("/api/lesson-records", new { lessonId = lesson.Id, attendance = "attended", content = "x", courseCompleted = "yes" });
        Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);
    }

    private sealed class FixedClock : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => new(2026, 11, 5, 18, 0, 0, TimeSpan.Zero);
    }
}
