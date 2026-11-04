using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using NextageClass.Api.Catalog;
using NextageClass.Api.Students;
using Npgsql;
using TestApplication = NextageClass.Api.Tests.AccountAccessTests.AccessApplication;

namespace NextageClass.Api.Tests;

[Collection("ApiDatabase")]
public sealed class CatalogTests(AccessDatabase database)
{
    private async Task<HttpClient> TeacherAsync(TestApplication application)
    {
        var client = application.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", application.Token((await database.AddTeacherAsync()).ToString()));
        return client;
    }

    private async Task<BookData> BookAsync(HttpClient client, params string[] levels)
    {
        using var response = await client.PostAsJsonAsync("/api/books", new BookInput(" Sequência própria ", levels));
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var book = (await response.Content.ReadFromJsonAsync<BookData>())!;
        database.TrackBook(book.Id);
        Assert.Equal("Sequência própria", book.Title);
        return book;
    }

    private async Task<MaterialData> MaterialAsync(HttpClient client, MaterialInput input)
    {
        using var response = await client.PostAsJsonAsync("/api/materials", input);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var material = (await response.Content.ReadFromJsonAsync<MaterialData>())!;
        database.TrackMaterial(material.Id);
        return material;
    }

    [Fact]
    public async Task TeacherPersistsEditsAndReadsInheritedLevelsAndLiteralContent()
    {
        await using var application = new TestApplication(database.Connection);
        using var client = await TeacherAsync(application);
        var book = await BookAsync(client, "A1", "A2");
        var unit = await MaterialAsync(client, new MaterialInput("Unidade própria", "Texto original", book.Id, 2, ["C2"], "C2"));
        var support = await MaterialAsync(client, new MaterialInput("Apoio", "<script>literal</script> & texto", Levels: ["B1", "B2"]));
        Assert.Equal(new[] { "A1", "A2" }, unit.Levels);
        Assert.Equal("A1", unit.Level);
        using var editBook = await client.PutAsJsonAsync($"/api/books/{book.Id}", new BookInput("Nova sequência", ["A2"]));
        Assert.Equal(HttpStatusCode.OK, editBook.StatusCode);
        var updatedBook = (await editBook.Content.ReadFromJsonAsync<BookData>())!;
        Assert.Equal(book.CreatedAt, updatedBook.CreatedAt);
        Assert.True(updatedBook.UpdatedAt >= book.UpdatedAt);
        var catalog = (await client.GetFromJsonAsync<CatalogData>("/api/catalog"))!;
        var inherited = catalog.Materials.Single(item => item.Id == unit.Id);
        Assert.Equal(new[] { "A2" }, inherited.Levels);
        Assert.Equal("A2", inherited.Level);
        Assert.Equal(unit.CreatedAt, inherited.CreatedAt);
        Assert.Equal(support.Content, catalog.Materials.Single(item => item.Id == support.Id).Content);
        using var edited = await client.PutAsJsonAsync($"/api/materials/{unit.Id}", new MaterialInput("Título atualizado", "Novo texto", book.Id, 2));
        Assert.Equal(HttpStatusCode.OK, edited.StatusCode);
        var changed = (await edited.Content.ReadFromJsonAsync<MaterialData>())!;
        Assert.Equal(unit.CreatedAt, changed.CreatedAt);
        Assert.Equal(unit.Id, changed.Id);
        Assert.True(changed.UpdatedAt >= unit.UpdatedAt);
        Assert.Equal("Novo texto", changed.Content);
        Assert.Contains((await client.GetFromJsonAsync<List<BookData>>("/api/books"))!, item => item.Id == book.Id && item.Title == "Nova sequência");
    }

    [Fact]
    public async Task InvalidCatalogInputsAndMissingIdsLeaveStoredDataUntouched()
    {
        await using var application = new TestApplication(database.Connection);
        using var client = await TeacherAsync(application);
        var book = await BookAsync(client, "A1");
        var unit = await MaterialAsync(client, new MaterialInput("Original", "Texto original", book.Id, 1));
        foreach (var input in new[] { new BookInput("", ["A1"]), new BookInput("Inválido", []), new BookInput("Inválido", ["A1", "A1"]), new BookInput("Inválido", ["A3"]), new BookInput("Inválido", null!) })
            Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync($"/api/books/{book.Id}", input)).StatusCode);
        foreach (var input in new[] {
            new MaterialInput("", "Texto", book.Id, 1), new MaterialInput("Título", " ", book.Id, 1),
            new MaterialInput("Título", "Texto", book.Id), new MaterialInput("Título", "Texto", book.Id, 0),
            new MaterialInput("Título", "Texto", book.Id, 10000), new MaterialInput("Título", "Texto", "missing", 1),
            new MaterialInput("Título", "Texto", LessonNumber: 1, Levels: ["A1"]),
            new MaterialInput("Título", "Texto", Levels: ["A1", "A1"]), new MaterialInput("Título", "Texto"),
            new MaterialInput("Título", new string('x', 20001), Levels: ["A1"]) })
            Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync($"/api/materials/{unit.Id}", input)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.PutAsJsonAsync("/api/books/missing", new BookInput("Válido", ["A1"]))).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.PutAsJsonAsync("/api/materials/missing", new MaterialInput("Válido", "Texto", Levels: ["A1"]))).StatusCode);
        var catalog = (await client.GetFromJsonAsync<CatalogData>("/api/catalog"))!;
        Assert.Equal("Original", catalog.Materials.Single(item => item.Id == unit.Id).Title);
        Assert.Equal(unit.UpdatedAt, catalog.Materials.Single(item => item.Id == unit.Id).UpdatedAt);
        Assert.Equal(book.Title, catalog.Books.Single(item => item.Id == book.Id).Title);
    }

    [Fact]
    public async Task ConcurrentDuplicateNumbersHaveOneWinnerAndOtherBooksRemainIndependent()
    {
        await using var application = new TestApplication(database.Connection);
        using var client = await TeacherAsync(application);
        var book = await BookAsync(client, "A1");
        var otherBook = await BookAsync(client, "A1");
        var input = new MaterialInput("Concorrente", "Texto", book.Id, 2);
        var responses = await Task.WhenAll(client.PostAsJsonAsync("/api/materials", input), client.PostAsJsonAsync("/api/materials", input));
        try
        {
            var winner = Assert.Single(responses, response => response.StatusCode == HttpStatusCode.Created);
            var saved = (await winner.Content.ReadFromJsonAsync<MaterialData>())!;
            database.TrackMaterial(saved.Id);
            var conflict = Assert.Single(responses, response => response.StatusCode == HttpStatusCode.Conflict);
            Assert.Contains("Já existe a Unidade 2", await conflict.Content.ReadAsStringAsync());
            await MaterialAsync(client, new MaterialInput("Outra sequência", "Texto", otherBook.Id, 2));
            var tenth = await MaterialAsync(client, new MaterialInput("Décima", "Texto", book.Id, 10));
            Assert.Equal(HttpStatusCode.Conflict, (await client.PutAsJsonAsync($"/api/materials/{tenth.Id}", input)).StatusCode);
            var units = (await client.GetFromJsonAsync<CatalogData>("/api/catalog"))!.Materials.Where(item => item.BookId == book.Id).ToArray();
            Assert.Equal(new int?[] { 2, 10 }, units.Select(item => item.LessonNumber));
            Assert.Equal("Décima", units[1].Title);
        }
        finally { foreach (var response in responses) response.Dispose(); }
    }

    [Fact]
    public async Task MaterialsCanChangeBetweenUnitAndSupportWithoutChangingIdentity()
    {
        await using var application = new TestApplication(database.Connection);
        using var client = await TeacherAsync(application);
        var book = await BookAsync(client, "A1");
        var unit = await MaterialAsync(client, new MaterialInput("Unidade", "Texto", book.Id, 1));
        using var asSupport = await client.PutAsJsonAsync($"/api/materials/{unit.Id}", new MaterialInput("Apoio", "Texto", Levels: ["B1"]));
        Assert.Equal(HttpStatusCode.OK, asSupport.StatusCode);
        var support = (await asSupport.Content.ReadFromJsonAsync<MaterialData>())!;
        Assert.Null(support.BookId);
        Assert.Null(support.LessonNumber);
        Assert.Equal(new[] { "B1" }, support.Levels);
        Assert.Equal(unit.CreatedAt, support.CreatedAt);
        using var asUnit = await client.PutAsJsonAsync($"/api/materials/{unit.Id}", new MaterialInput("Unidade", "Texto", book.Id, 10));
        Assert.Equal(HttpStatusCode.OK, asUnit.StatusCode);
        var restored = (await asUnit.Content.ReadFromJsonAsync<MaterialData>())!;
        Assert.Equal(unit.Id, restored.Id);
        Assert.Equal(new[] { "A1" }, restored.Levels);
        Assert.Equal(10, restored.LessonNumber);
    }

    [Fact]
    public async Task PrimarySequencePreservesOmissionsAndIncompatibilityUntilExplicitReplacement()
    {
        await using var application = new TestApplication(database.Connection);
        using var client = await TeacherAsync(application);
        var book = await BookAsync(client, "A1");
        var otherBook = await BookAsync(client, "A2");
        using var response = await client.PostAsJsonAsync("/api/students", new StudentInput("Vínculo", "A1", new DateOnly(2026, 11, 4)) { PrimaryBookId = book.Id });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var person = (await response.Content.ReadFromJsonAsync<StudentData>())!;
        database.TrackStudent(person.Id);
        var path = $"/api/students/{person.Id}";
        Assert.Equal(book.Id, person.PrimaryBookId);
        using var promoted = await client.PutAsJsonAsync(path, new StudentInput("Promovido", "B1", person.StartDate) { PrimaryBookId = book.Id });
        Assert.Equal(HttpStatusCode.OK, promoted.StatusCode);
        Assert.Equal(book.Id, (await promoted.Content.ReadFromJsonAsync<StudentData>())!.PrimaryBookId);
        using var omitted = await client.PutAsJsonAsync(path, new { name = "Omitido", level = "B1", startDate = person.StartDate });
        Assert.Equal(HttpStatusCode.OK, omitted.StatusCode);
        Assert.Equal(book.Id, (await omitted.Content.ReadFromJsonAsync<StudentData>())!.PrimaryBookId);
        foreach (var selected in new[] { "missing", otherBook.Id })
            Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync(path, new StudentInput("Não gravar", "B1", person.StartDate) { PrimaryBookId = selected })).StatusCode);
        var unchanged = (await client.GetFromJsonAsync<List<StudentData>>("/api/students"))!.Single(item => item.Id == person.Id);
        Assert.Equal("Omitido", unchanged.Name);
        Assert.Equal(book.Id, unchanged.PrimaryBookId);
        using var cleared = await client.PutAsJsonAsync(path, new StudentInput("Sem sequência", "B1", person.StartDate) { PrimaryBookId = null });
        Assert.Equal(HttpStatusCode.OK, cleared.StatusCode);
        var without = (await cleared.Content.ReadFromJsonAsync<StudentData>())!;
        Assert.Null(without.PrimaryBookId);
        Assert.Equal(person.CreatedAt, without.CreatedAt);
        Assert.Equal(person.Id, without.Id);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/students", new StudentInput("Inválido", "B1", person.StartDate) { PrimaryBookId = otherBook.Id })).StatusCode);
    }

    [Fact]
    public async Task CatalogReadsAndWritesRequireAnActiveTeacherDespiteEditableClaims()
    {
        await using var application = new TestApplication(database.Connection);
        var (student, _) = await database.AddStudentAsync();
        var (inactive, _) = await database.AddStudentAsync(false);
        using var client = application.CreateClient();
        foreach (var identity in new Guid?[] { null, student, inactive, Guid.NewGuid() })
        {
            client.DefaultRequestHeaders.Authorization = identity is null ? null : new AuthenticationHeaderValue("Bearer", application.Token(identity.ToString()!));
            var expected = identity is null ? HttpStatusCode.Unauthorized : HttpStatusCode.Forbidden;
            Assert.Equal(expected, (await client.GetAsync("/api/catalog")).StatusCode);
            Assert.Equal(expected, (await client.GetAsync("/api/books")).StatusCode);
            Assert.Equal(expected, (await client.PostAsJsonAsync("/api/books", new BookInput("Negado", ["A1"]))).StatusCode);
            Assert.Equal(expected, (await client.PutAsJsonAsync("/api/books/missing", new BookInput("Negado", ["A1"]))).StatusCode);
            Assert.Equal(expected, (await client.PostAsJsonAsync("/api/materials", new MaterialInput("Negado", "Texto", Levels: ["A1"]))).StatusCode);
            Assert.Equal(expected, (await client.PutAsJsonAsync("/api/materials/missing", new MaterialInput("Negado", "Texto", Levels: ["A1"]))).StatusCode);
        }
    }

    [Fact]
    public async Task NewCatalogTablesKeepRlsAndNoPublicPrivileges()
    {
        await using var source = NpgsqlDataSource.Create(database.Connection);
        await using var rls = source.CreateCommand("SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='app' AND c.relname IN ('books','materials') AND c.relrowsecurity");
        Assert.Equal(2L, await rls.ExecuteScalarAsync());
        await using var grants = source.CreateCommand("SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace CROSS JOIN LATERAL aclexplode(COALESCE(c.relacl,acldefault('r',c.relowner))) p WHERE n.nspname='app' AND c.relname IN ('books','materials') AND p.grantee=0");
        Assert.Equal(0L, await grants.ExecuteScalarAsync());
    }
}
