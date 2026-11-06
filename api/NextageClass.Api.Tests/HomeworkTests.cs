using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using NextageClass.Api.Scheduling;
using TestApplication = NextageClass.Api.Tests.AccountAccessTests.AccessApplication;

namespace NextageClass.Api.Tests;

[Collection("ApiDatabase")]
public sealed class HomeworkTests(AccessDatabase database)
{
    [Fact]
    public async Task CorrectionSurvivesUnrelatedEditsAndChangingDescriptionResetsIt()
    {
        var (user, student) = await database.AddStudentAsync();
        var clock = new HomeworkClock { Now = new(2026, 11, 5, 18, 0, 0, TimeSpan.Zero) };
        await using var app = new TestApplication(database.Connection, services => services.AddSingleton<TimeProvider>(clock));
        using var client = app.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", app.Token((await database.AddTeacherAsync()).ToString()));
        using var denied = app.CreateClient();
        denied.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", app.Token(user.ToString()));
        Assert.Equal(HttpStatusCode.Forbidden, (await denied.PostAsJsonAsync("/api/lesson-records/homework", new HomeworkCorrectionInput("missing", true, ""))).StatusCode);
        var created = await client.PostAsJsonAsync("/api/agenda/lessons", new ScheduleLessonInput(student, new(2026, 11, 2), 19, false, null));
        created.EnsureSuccessStatusCode();
        var lesson = Assert.Single((await created.Content.ReadFromJsonAsync<ScheduleData>())!.Lessons, item => item.StudentId == student);
        var saved = await client.PostAsJsonAsync("/api/lesson-records", new { lessonId = lesson.Id, attendance = "attended", content = "Conversação", homework = "Exercício 1" });
        saved.EnsureSuccessStatusCode();
        var record = Assert.Single((await saved.Content.ReadFromJsonAsync<List<LessonRecordData>>())!, item => item.LessonId == lesson.Id);
        Assert.Equal("Exercício 1", record.Homework!.Description);
        Assert.Null(record.Homework.CorrectedAt);
        clock.Now = clock.Now.AddHours(1);
        var corrected = await client.PostAsJsonAsync("/api/lesson-records/homework", new HomeworkCorrectionInput(record.Id, true, "Exercício 1"));
        corrected.EnsureSuccessStatusCode();
        var correctedRecord = Assert.Single((await corrected.Content.ReadFromJsonAsync<List<LessonRecordData>>())!, item => item.Id == record.Id);
        Assert.Equal(clock.Now.UtcDateTime, correctedRecord.Homework!.CorrectedAt);
        var edited = await client.PostAsJsonAsync("/api/lesson-records", new { lessonId = lesson.Id, attendance = "attended", content = "Anotação editada" });
        edited.EnsureSuccessStatusCode();
        Assert.Equal(correctedRecord.Homework, Assert.Single((await edited.Content.ReadFromJsonAsync<List<LessonRecordData>>())!, item => item.Id == record.Id).Homework);
        var changed = await client.PostAsJsonAsync("/api/lesson-records", new { lessonId = lesson.Id, attendance = "attended", content = "Anotação editada", homework = "Exercício 2" });
        changed.EnsureSuccessStatusCode();
        var changedRecord = Assert.Single((await changed.Content.ReadFromJsonAsync<List<LessonRecordData>>())!, item => item.Id == record.Id);
        Assert.Equal("Exercício 2", changedRecord.Homework!.Description);
        Assert.Null(changedRecord.Homework.CorrectedAt);
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsJsonAsync("/api/lesson-records/homework", new HomeworkCorrectionInput(record.Id, true, "Exercício 1"))).StatusCode);
        (await client.PostAsJsonAsync("/api/lesson-records/homework", new HomeworkCorrectionInput(record.Id, true, "Exercício 2"))).EnsureSuccessStatusCode();
        var pending = await client.PostAsJsonAsync("/api/lesson-records/homework", new HomeworkCorrectionInput(record.Id, false, "Exercício 2"));
        pending.EnsureSuccessStatusCode();
        Assert.Null(Assert.Single((await pending.Content.ReadFromJsonAsync<List<LessonRecordData>>())!, item => item.Id == record.Id).Homework!.CorrectedAt);
        var removed = await client.PostAsJsonAsync("/api/lesson-records", new { lessonId = lesson.Id, attendance = "attended", content = "Anotação editada", homework = "" });
        removed.EnsureSuccessStatusCode();
        Assert.Null(Assert.Single((await removed.Content.ReadFromJsonAsync<List<LessonRecordData>>())!, item => item.Id == record.Id).Homework);
    }

    private sealed class HomeworkClock : TimeProvider
    {
        public DateTimeOffset Now { get; set; }
        public override DateTimeOffset GetUtcNow() => Now;
    }
}
