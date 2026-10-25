using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;

namespace NextageClass.Api.Access;

public static class SupabaseAccess
{
    public static void AddSupabaseAccess(this WebApplicationBuilder builder)
    {
        var projectUrl = builder.Configuration["Supabase:Url"];
        if (!Uri.TryCreate(projectUrl, UriKind.Absolute, out var project) || project.Scheme != "https" ||
            !string.IsNullOrEmpty(project.UserInfo) || project.AbsolutePath != "/" || !string.IsNullOrEmpty(project.Query) || !string.IsNullOrEmpty(project.Fragment))
            throw new InvalidOperationException("Configure Supabase__Url com a URL HTTPS do projeto.");
        var issuer = project.GetLeftPart(UriPartial.Authority) + "/auth/v1";
        builder.Services.AddHttpContextAccessor();
        builder.Services.AddScoped<AccessProfileStore>();
        builder.Services.AddScoped<CurrentAccess>();
        builder.Services.AddScoped<IAuthorizationHandler, AccessAuthorizationHandler>();
        builder.Services.AddAuthorization(options =>
        {
            options.AddPolicy("Member", policy => policy.RequireAuthenticatedUser().AddRequirements(new AccessRequirement()));
            options.AddPolicy("Teacher", policy => policy.RequireAuthenticatedUser().AddRequirements(new AccessRequirement("teacher")));
            options.AddPolicy("Student", policy => policy.RequireAuthenticatedUser().AddRequirements(new AccessRequirement("student")));
        });
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
        {
            options.MapInboundClaims = false;
            options.IncludeErrorDetails = false;
            options.ConfigurationManager = new ConfigurationManager<OpenIdConnectConfiguration>(
                issuer + "/.well-known/jwks.json", new SupabaseSigningKeys(issuer))
            {
                AutomaticRefreshInterval = TimeSpan.FromMinutes(10),
                RefreshInterval = TimeSpan.FromMinutes(1),
                UseLastKnownGoodConfiguration = false
            };
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = issuer,
                ValidateAudience = true,
                ValidAudience = "authenticated",
                ValidateLifetime = true,
                RequireExpirationTime = true,
                RequireSignedTokens = true,
                ValidateIssuerSigningKey = true,
                ClockSkew = TimeSpan.FromSeconds(30),
                ValidAlgorithms = [SecurityAlgorithms.EcdsaSha256, SecurityAlgorithms.RsaSha256]
            };
        });
    }

    private sealed class SupabaseSigningKeys(string issuer) : IConfigurationRetriever<OpenIdConnectConfiguration>
    {
        public async Task<OpenIdConnectConfiguration> GetConfigurationAsync(string address, IDocumentRetriever retriever, CancellationToken cancel)
        {
            var document = await retriever.GetDocumentAsync(address, cancel);
            var configuration = new OpenIdConnectConfiguration { Issuer = issuer };
            foreach (var key in new JsonWebKeySet(document).GetSigningKeys()) configuration.SigningKeys.Add(key);
            return configuration;
        }
    }
}
