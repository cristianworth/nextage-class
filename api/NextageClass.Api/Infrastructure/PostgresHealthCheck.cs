using Microsoft.Extensions.Diagnostics.HealthChecks;
using Npgsql;

namespace NextageClass.Api.Infrastructure;

public sealed class PostgresHealthCheck(NpgsqlDataSource dataSource) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            await using var command = dataSource.CreateCommand("SELECT 1");
            command.CommandTimeout = 5;
            await command.ExecuteScalarAsync(cancellationToken);
            return HealthCheckResult.Healthy();
        }
        catch (Exception exception) when (exception is NpgsqlException or TimeoutException or OperationCanceledException)
        {
            return HealthCheckResult.Unhealthy("Database unavailable.");
        }
    }
}
