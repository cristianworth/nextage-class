using Npgsql;

namespace NextageClass.Api.Access;

public sealed record AccessProfile(Guid UserId, string DisplayName, string Role, string? StudentId);

public sealed class AccessProfileStore(NpgsqlDataSource source)
{
    public async Task<AccessProfile?> FindAsync(Guid userId, CancellationToken cancellationToken)
    {
        await using var command = source.CreateCommand("SELECT user_id, display_name, role, student_id FROM app.access_profiles WHERE user_id = $1 AND active");
        command.Parameters.AddWithValue(userId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken)
            ? new AccessProfile(reader.GetGuid(0), reader.GetString(1), reader.GetString(2), reader.IsDBNull(3) ? null : reader.GetString(3))
            : null;
    }
}
