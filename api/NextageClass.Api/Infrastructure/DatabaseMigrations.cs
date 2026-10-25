using System.Security.Cryptography;
using System.Text;
using Npgsql;

namespace NextageClass.Api.Infrastructure;

public static class DatabaseMigrations
{
    public static async Task ApplyAsync(NpgsqlDataSource source, CancellationToken cancellationToken = default)
    {
        await using var connection = await source.OpenConnectionAsync(cancellationToken);
        await using var migrationLock = new NpgsqlCommand("SELECT pg_advisory_lock(hashtext('nextage_class_migrations'))", connection);
        await migrationLock.ExecuteNonQueryAsync(cancellationToken);
        try
        {
            await using var setup = new NpgsqlCommand("""
                CREATE SCHEMA IF NOT EXISTS app;
                REVOKE ALL ON SCHEMA app FROM PUBLIC;
                CREATE TABLE IF NOT EXISTS app.schema_migrations (
                    name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now()
                );
                """, connection);
            await setup.ExecuteNonQueryAsync(cancellationToken);
            var assembly = typeof(DatabaseMigrations).Assembly;
            foreach (var resource in assembly.GetManifestResourceNames().Where(name => name.EndsWith(".sql", StringComparison.Ordinal)).Order(StringComparer.Ordinal))
            {
                using var reader = new StreamReader(assembly.GetManifestResourceStream(resource)!);
                var sql = (await reader.ReadToEndAsync(cancellationToken)).Replace("\r\n", "\n", StringComparison.Ordinal);
                var checksum = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(sql)));
                await using var existing = new NpgsqlCommand("SELECT checksum FROM app.schema_migrations WHERE name = $1", connection);
                existing.Parameters.AddWithValue(resource);
                var stored = await existing.ExecuteScalarAsync(cancellationToken);
                if (stored is string previous)
                {
                    if (previous != checksum) throw new InvalidOperationException($"A migração {resource} já aplicada foi alterada. Crie uma nova migração.");
                    continue;
                }
                await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
                await using var migration = new NpgsqlCommand(sql, connection, transaction);
                await migration.ExecuteNonQueryAsync(cancellationToken);
                await using var remember = new NpgsqlCommand("INSERT INTO app.schema_migrations(name, checksum) VALUES ($1, $2)", connection, transaction);
                remember.Parameters.AddWithValue(resource);
                remember.Parameters.AddWithValue(checksum);
                await remember.ExecuteNonQueryAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);
            }
        }
        finally
        {
            await using var release = new NpgsqlCommand("SELECT pg_advisory_unlock(hashtext('nextage_class_migrations'))", connection);
            await release.ExecuteNonQueryAsync(CancellationToken.None);
        }
    }
}
