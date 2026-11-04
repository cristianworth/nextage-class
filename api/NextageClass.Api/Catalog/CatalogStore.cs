using System.Data;
using NextageClass.Api.Infrastructure;
using Npgsql;
using NpgsqlTypes;

namespace NextageClass.Api.Catalog;

public sealed class CatalogStore(NpgsqlDataSource source)
{
    private const string BooksQuery = "SELECT id, title, levels, created_at, updated_at FROM app.books ORDER BY title, id";
    private const string MaterialsQuery = """
        SELECT m.id, m.title, m.content, COALESCE(b.levels,m.levels), m.book_id, m.lesson_number, m.created_at, m.updated_at
        FROM app.materials m LEFT JOIN app.books b ON b.id=m.book_id
        """;

    public async Task<List<BookData>> ListBooksAsync(CancellationToken cancellationToken)
    {
        await using var command = source.CreateCommand(BooksQuery);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await ReadBooksAsync(reader, cancellationToken);
    }

    public async Task<CatalogData> ReadAsync(CancellationToken cancellationToken)
    {
        await using var connection = await source.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(IsolationLevel.RepeatableRead, cancellationToken);
        await using var command = new NpgsqlCommand(BooksQuery + ";" + MaterialsQuery + " ORDER BY m.book_id, m.lesson_number NULLS LAST, m.title, m.id", connection, transaction);
        var books = new List<BookData>();
        var materials = new List<MaterialData>();
        await using (var reader = await command.ExecuteReaderAsync(cancellationToken))
        {
            books = await ReadBooksAsync(reader, cancellationToken);
            await reader.NextResultAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken)) materials.Add(ReadMaterial(reader));
        }
        await transaction.CommitAsync(cancellationToken);
        return new CatalogData(books, materials);
    }

    public async Task<BookData> SaveBookAsync(BookInput input, string? id, CancellationToken cancellationToken)
    {
        var values = input.Validated();
        await using var command = source.CreateCommand(id is null
            ? "INSERT INTO app.books(id,title,levels) VALUES ($1,$2,$3) RETURNING id,title,levels,created_at,updated_at"
            : "UPDATE app.books SET title=$2,levels=$3,updated_at=clock_timestamp() WHERE id=$1 RETURNING id,title,levels,created_at,updated_at");
        command.Parameters.AddWithValue(id ?? Guid.NewGuid().ToString());
        command.Parameters.AddWithValue(values.Title);
        command.Parameters.AddWithValue(values.Levels);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken)) throw new ApiFailure(404, "Sequência não encontrada.");
        return ReadBook(reader);
    }

    public async Task<MaterialData> SaveMaterialAsync(MaterialInput input, string? id, CancellationToken cancellationToken)
    {
        var values = input.Validated();
        await using var connection = await source.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
        if (values.BookId is not null)
        {
            await using var book = new NpgsqlCommand("SELECT id FROM app.books WHERE id=$1 FOR SHARE", connection, transaction);
            book.Parameters.AddWithValue(values.BookId);
            if (await book.ExecuteScalarAsync(cancellationToken) is null) throw new ApiFailure(400, "A sequência selecionada não foi encontrada.");
        }
        var materialId = id ?? Guid.NewGuid().ToString();
        try
        {
            await using var command = new NpgsqlCommand(id is null
                ? "INSERT INTO app.materials(id,title,content,book_id,lesson_number,levels) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id"
                : "UPDATE app.materials SET title=$2,content=$3,book_id=$4,lesson_number=$5,levels=$6,updated_at=clock_timestamp() WHERE id=$1 RETURNING id", connection, transaction);
            command.Parameters.AddWithValue(materialId);
            command.Parameters.AddWithValue(values.Title);
            command.Parameters.AddWithValue(values.Content);
            command.Parameters.AddWithValue(NpgsqlDbType.Text, (object?)values.BookId ?? DBNull.Value);
            command.Parameters.AddWithValue(NpgsqlDbType.Integer, (object?)values.LessonNumber ?? DBNull.Value);
            command.Parameters.AddWithValue(NpgsqlDbType.Array | NpgsqlDbType.Text, (object?)values.Levels ?? DBNull.Value);
            if (await command.ExecuteScalarAsync(cancellationToken) is null) throw new ApiFailure(404, "Material não encontrado.");
        }
        catch (PostgresException exception) when (exception.SqlState == PostgresErrorCodes.UniqueViolation && exception.ConstraintName == "materials_book_unit_number")
        {
            throw new ApiFailure(409, $"Já existe a Unidade {values.LessonNumber} nesta sequência. Escolha outro número.");
        }
        MaterialData result;
        await using (var query = new NpgsqlCommand(MaterialsQuery + " WHERE m.id=$1", connection, transaction))
        {
            query.Parameters.AddWithValue(materialId);
            await using var reader = await query.ExecuteReaderAsync(cancellationToken);
            await reader.ReadAsync(cancellationToken);
            result = ReadMaterial(reader);
        }
        await transaction.CommitAsync(cancellationToken);
        return result;
    }

    private static async Task<List<BookData>> ReadBooksAsync(NpgsqlDataReader reader, CancellationToken cancellationToken)
    {
        var books = new List<BookData>();
        while (await reader.ReadAsync(cancellationToken)) books.Add(ReadBook(reader));
        return books;
    }

    private static BookData ReadBook(NpgsqlDataReader reader) => new(reader.GetString(0), reader.GetString(1), reader.GetFieldValue<string[]>(2), reader.GetDateTime(3), reader.GetDateTime(4));

    private static MaterialData ReadMaterial(NpgsqlDataReader reader)
    {
        var levels = reader.GetFieldValue<string[]>(3);
        return new MaterialData(reader.GetString(0), reader.GetString(1), reader.GetString(2), levels[0], levels,
            reader.IsDBNull(4) ? null : reader.GetString(4), reader.IsDBNull(5) ? null : reader.GetInt32(5), reader.GetDateTime(6), reader.GetDateTime(7));
    }
}
