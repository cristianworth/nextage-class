using System.ComponentModel.DataAnnotations;
using NextageClass.Api.Infrastructure;
using Npgsql;

namespace NextageClass.Api.Invitations;

public sealed record InvitationInput(string Email);
public sealed record InvitationReceipt(Guid Id, string StudentId, string Email, string Status, DateTime CreatedAt, DateTime UpdatedAt);

public sealed class StudentInvitationService(NpgsqlDataSource source, IInvitationProvider provider, ILogger<StudentInvitationService> logger)
{
    public async Task<List<InvitationReceipt>> ListAsync(CancellationToken cancellationToken)
    {
        await using var command = source.CreateCommand("SELECT id, student_id, email, status, created_at, updated_at FROM app.student_invitations ORDER BY created_at DESC, id");
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var invitations = new List<InvitationReceipt>();
        while (await reader.ReadAsync(cancellationToken)) invitations.Add(ReadReceipt(reader));
        return invitations;
    }

    public async Task<InvitationReceipt> InviteAsync(string studentId, InvitationInput input, CancellationToken cancellationToken)
    {
        var email = (input.Email ?? "").Trim();
        if (email.Length is < 3 or > 254 || !new EmailAddressAttribute().IsValid(email))
            throw new ApiFailure(400, "Informe um e-mail válido para o convite.");
        if (!provider.IsConfigured) throw new ApiFailure(503, "O envio de convites ainda não está configurado. Nenhum convite foi enviado.");

        string name;
        var invitationId = Guid.NewGuid();
        try
        {
            await using var connection = await source.OpenConnectionAsync(cancellationToken);
            await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
            await using var student = new NpgsqlCommand("SELECT name FROM app.students WHERE id = $1 FOR UPDATE", connection, transaction);
            student.Parameters.AddWithValue(studentId);
            name = await student.ExecuteScalarAsync(cancellationToken) as string ?? throw new ApiFailure(404, "Aluno não encontrado.");
            await using var linked = new NpgsqlCommand("SELECT 1 FROM app.access_profiles WHERE student_id = $1", connection, transaction);
            linked.Parameters.AddWithValue(studentId);
            if (await linked.ExecuteScalarAsync(cancellationToken) is not null) throw new ApiFailure(409, "Este aluno já possui um vínculo de acesso. Confira a conta antes de convidar novamente.");
            await using var pending = new NpgsqlCommand("INSERT INTO app.student_invitations(id,student_id,email,status) VALUES ($1,$2,$3,'pending')", connection, transaction);
            pending.Parameters.AddWithValue(invitationId);
            pending.Parameters.AddWithValue(studentId);
            pending.Parameters.AddWithValue(email);
            await pending.ExecuteNonQueryAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch (PostgresException exception) when (exception.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            throw new ApiFailure(409, "Já existe um convite para esse aluno ou e-mail. Confira o envio antes de tentar novamente.");
        }

        Guid? invitedUser = null;
        try
        {
            var identity = await provider.SendAsync(email, cancellationToken);
            invitedUser = identity.UserId;
            if (identity.UserId == Guid.Empty || !string.Equals(email, identity.Email, StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("A identidade retornada não corresponde ao convite.");
            await using var connection = await source.OpenConnectionAsync(cancellationToken);
            await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
            await using var profile = new NpgsqlCommand("INSERT INTO app.access_profiles(user_id,role,student_id,display_name) VALUES ($1,'student',$2,$3)", connection, transaction);
            profile.Parameters.AddWithValue(identity.UserId);
            profile.Parameters.AddWithValue(studentId);
            profile.Parameters.AddWithValue(name);
            await profile.ExecuteNonQueryAsync(cancellationToken);
            await using var sent = new NpgsqlCommand("UPDATE app.student_invitations SET status='sent',auth_user_id=$1,updated_at=now() WHERE id=$2 RETURNING id,student_id,email,status,created_at,updated_at", connection, transaction);
            sent.Parameters.AddWithValue(identity.UserId);
            sent.Parameters.AddWithValue(invitationId);
            InvitationReceipt receipt;
            await using (var reader = await sent.ExecuteReaderAsync(cancellationToken))
            {
                await reader.ReadAsync(cancellationToken);
                receipt = ReadReceipt(reader);
            }
            await transaction.CommitAsync(cancellationToken);
            return receipt;
        }
        catch (Exception exception) when (exception is not OutOfMemoryException and not StackOverflowException)
        {
            logger.LogWarning("Invitation {InvitationId} needs review; delivery or account linking could not be confirmed.", invitationId);
            await using var review = source.CreateCommand("UPDATE app.student_invitations SET status='needs_review',auth_user_id=$1,updated_at=now() WHERE id=$2 AND status='pending'");
            review.Parameters.AddWithValue(NpgsqlTypes.NpgsqlDbType.Uuid, (object?)invitedUser ?? DBNull.Value);
            review.Parameters.AddWithValue(invitationId);
            await review.ExecuteNonQueryAsync(CancellationToken.None);
            throw new ApiFailure(503, "Não foi possível confirmar o envio e o acesso do aluno. Confira este convite antes de tentar novamente; ele ficou marcado para revisão.");
        }
    }

    private static InvitationReceipt ReadReceipt(NpgsqlDataReader reader) =>
        new(reader.GetGuid(0), reader.GetString(1), reader.GetString(2), reader.GetString(3), reader.GetDateTime(4), reader.GetDateTime(5));
}
