namespace NextageClass.Api.Invitations;

public sealed record InvitedIdentity(Guid UserId, string Email);

public interface IInvitationProvider
{
    bool IsConfigured { get; }
    Task<InvitedIdentity> SendAsync(string email, CancellationToken cancellationToken);
}

public sealed class SupabaseInvitationProvider : IInvitationProvider
{
    private readonly Supabase.Gotrue.Interfaces.IGotrueAdminClient<Supabase.Gotrue.User>? admin;
    private readonly string? redirectUrl;
    public bool IsConfigured => admin is not null && !string.IsNullOrWhiteSpace(redirectUrl);

    public SupabaseInvitationProvider(IConfiguration configuration)
    {
        var secret = configuration["Supabase:SecretKey"];
        redirectUrl = configuration["Supabase:InvitationRedirectUrl"];
        if (string.IsNullOrWhiteSpace(secret)) return;
        if (!Uri.TryCreate(redirectUrl, UriKind.Absolute, out var redirect) ||
            (redirect.Scheme != "https" && !(redirect.IsLoopback && redirect.Scheme == "http")))
            throw new InvalidOperationException("Configure Supabase__InvitationRedirectUrl com a URL de ativação permitida.");
        var client = new Supabase.Client(configuration["Supabase:Url"]!, secret,
            new Supabase.SupabaseOptions { AutoConnectRealtime = false, AutoRefreshToken = false });
        admin = client.AdminAuth(secret);
    }

    public async Task<InvitedIdentity> SendAsync(string email, CancellationToken cancellationToken)
    {
        if (!IsConfigured) throw new InvalidOperationException("Convites não configurados.");
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeout.CancelAfter(TimeSpan.FromSeconds(15));
        var sent = await admin!.InviteUserByEmail(email,
            new Supabase.Gotrue.InviteUserByEmailOptions { RedirectTo = redirectUrl! }).WaitAsync(timeout.Token);
        if (!sent) throw new InvalidOperationException("O provedor não confirmou o convite.");
        // The SDK returns a boolean for invites, so resolve the exact identity through its admin contract.
        for (var page = 1; ; page++)
        {
            var result = await admin.ListUsers(filter: email, page: page, perPage: 100).WaitAsync(timeout.Token)
                ?? throw new InvalidOperationException("O provedor não retornou a consulta de identidade.");
            var users = result.Users ?? [];
            var match = users.Where(user => string.Equals(user.Email, email, StringComparison.OrdinalIgnoreCase)).ToArray();
            if (match.Length == 1 && Guid.TryParse(match[0].Id, out var id)) return new InvitedIdentity(id, match[0].Email!);
            if (match.Length > 1 || users.Count < 100) break;
        }
        throw new InvalidOperationException("Não foi possível confirmar a identidade convidada.");
    }
}
