using Microsoft.AspNetCore.Authorization;

namespace NextageClass.Api.Access;

public sealed class CurrentAccess(IHttpContextAccessor accessor, AccessProfileStore store)
{
    private Task<AccessProfile?>? loaded;

    public Task<AccessProfile?> GetAsync() => loaded ??= LoadAsync();

    private Task<AccessProfile?> LoadAsync()
    {
        var context = accessor.HttpContext;
        return context?.User.Identity?.IsAuthenticated == true && Guid.TryParse(context.User.FindFirst("sub")?.Value, out var id)
            ? store.FindAsync(id, context.RequestAborted)
            : Task.FromResult<AccessProfile?>(null);
    }
}

public sealed record AccessRequirement(string? Role = null) : IAuthorizationRequirement;

public sealed class AccessAuthorizationHandler(CurrentAccess current) : AuthorizationHandler<AccessRequirement>
{
    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, AccessRequirement requirement)
    {
        var profile = await current.GetAsync();
        if (profile is not null && (requirement.Role is null || requirement.Role == profile.Role)) context.Succeed(requirement);
    }
}
