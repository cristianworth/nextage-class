using System.Text.Json.Serialization;
using NextageClass.Api.Infrastructure;

namespace NextageClass.Api.Catalog;

public sealed record BookInput(string Title, string[] Levels)
{
    public BookInput Validated() => new(CatalogValidation.Title(Title), CatalogValidation.Levels(Levels));
}

public sealed record BookData(string Id, string Title, string[] Levels, DateTime CreatedAt, DateTime UpdatedAt);

public sealed record MaterialInput(string Title, string Content, string? BookId = null, int? LessonNumber = null, string[]? Levels = null, string? Level = null)
{
    public MaterialInput Validated()
    {
        var title = CatalogValidation.Title(Title);
        var content = (Content ?? "").Trim();
        if (content.Length is < 1 or > 20000) throw new ApiFailure(400, "Informe um conteúdo com até 20.000 caracteres.");
        if (BookId is not null)
        {
            if (string.IsNullOrWhiteSpace(BookId) || BookId.Length > 100 || LessonNumber is null or < 1 or > 9999)
                throw new ApiFailure(400, "Uma unidade precisa de sequência e número de 1 a 9999.");
            return this with { Title = title, Content = content, Levels = null };
        }
        if (LessonNumber is not null) throw new ApiFailure(400, "Material de apoio não possui número de unidade.");
        return this with { Title = title, Content = content, Levels = CatalogValidation.Levels(Levels ?? (Level is null ? null : [Level])) };
    }
}

public sealed record MaterialData(string Id, string Title, string Content, string Level, string[] Levels,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] string? BookId,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] int? LessonNumber,
    DateTime CreatedAt, DateTime UpdatedAt);

public sealed record CatalogData(List<BookData> Books, List<MaterialData> Materials);

internal static class CatalogValidation
{
    public static string Title(string? title)
    {
        var value = (title ?? "").Trim();
        if (value.Length is < 1 or > 150) throw new ApiFailure(400, "Informe um título com até 150 caracteres.");
        return value;
    }

    public static string[] Levels(string[]? levels)
    {
        if (levels is null || levels.Length is < 1 or > 6 || levels.Distinct().Count() != levels.Length ||
            levels.Any(level => !new[] { "A1", "A2", "B1", "B2", "C1", "C2" }.Contains(level)))
            throw new ApiFailure(400, "Selecione níveis válidos, sem repetir, entre A1 e C2.");
        return levels;
    }
}
