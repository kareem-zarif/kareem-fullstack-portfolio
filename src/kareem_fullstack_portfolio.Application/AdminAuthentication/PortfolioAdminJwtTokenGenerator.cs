using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Volo.Abp;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Identity;
using Volo.Abp.Security.Claims;
using AbpIdentityUser = Volo.Abp.Identity.IdentityUser;

namespace kareem_fullstack_portfolio.AdminAuthentication;

public class PortfolioAdminJwtTokenGenerator : ITransientDependency
{
    private readonly IdentityUserManager _identityUserManager;
    private readonly IOptions<PortfolioAdminAuthenticationOptions> _adminAuthenticationOptions;

    public PortfolioAdminJwtTokenGenerator(
        IdentityUserManager identityUserManager,
        IOptions<PortfolioAdminAuthenticationOptions> adminAuthenticationOptions)
    {
        _identityUserManager = identityUserManager;
        _adminAuthenticationOptions = adminAuthenticationOptions;
    }

    public async Task<PortfolioAdminAccessTokenResult> GenerateAsync(AbpIdentityUser user)
    {
        var options = _adminAuthenticationOptions.Value;
        options.EnsureValid();

        var issuedAtUtc = DateTime.UtcNow;
        var expiresAtUtc = issuedAtUtc.AddMinutes(options.AccessTokenExpirationMinutes);

        return new PortfolioAdminAccessTokenResult(
            await CreateTokenAsync(user, issuedAtUtc, expiresAtUtc, options),
            expiresAtUtc);
    }

    private async Task<string> CreateTokenAsync(
        AbpIdentityUser user,
        DateTime issuedAtUtc,
        DateTime expiresAtUtc,
        PortfolioAdminAuthenticationOptions options)
    {
        var header = new Dictionary<string, object>
        {
            ["alg"] = SecurityAlgorithms.HmacSha256,
            ["typ"] = "JWT"
        };

        var payload = new Dictionary<string, object>
        {
            ["iss"] = options.Issuer ?? string.Empty,
            ["aud"] = options.Audience,
            [PortfolioAdminAuthenticationClaimNames.Subject] = user.Id.ToString(),
            [PortfolioAdminAuthenticationClaimNames.UniqueName] = user.UserName ?? string.Empty,
            [PortfolioAdminAuthenticationClaimNames.TokenId] = Guid.NewGuid().ToString("N"),
            [PortfolioAdminAuthenticationClaimNames.NotBefore] = ToUnixTimeSeconds(issuedAtUtc),
            [PortfolioAdminAuthenticationClaimNames.IssuedAt] = ToUnixTimeSeconds(issuedAtUtc),
            [PortfolioAdminAuthenticationClaimNames.ExpirationTime] = ToUnixTimeSeconds(expiresAtUtc),
            [ClaimTypes.NameIdentifier] = user.Id.ToString(),
            [ClaimTypes.Name] = user.UserName ?? string.Empty,
            [AbpClaimTypes.UserId] = user.Id.ToString(),
            [AbpClaimTypes.UserName] = user.UserName ?? string.Empty
        };

        if (!user.Email.IsNullOrWhiteSpace())
        {
            payload[PortfolioAdminAuthenticationClaimNames.Email] = user.Email;
            payload[ClaimTypes.Email] = user.Email;
            payload[AbpClaimTypes.Email] = user.Email;
        }

        if (!user.Name.IsNullOrWhiteSpace())
        {
            payload[AbpClaimTypes.Name] = user.Name;
        }

        if (user.TenantId.HasValue)
        {
            payload[AbpClaimTypes.TenantId] = user.TenantId.Value.ToString();
        }

        var roles = await _identityUserManager.GetRolesAsync(user);
        var distinctRoles = roles
            .Where(role => !role.IsNullOrWhiteSpace())
            .Distinct(StringComparer.Ordinal)
            .ToArray();

        if (distinctRoles.Length == 1)
        {
            payload[ClaimTypes.Role] = distinctRoles[0];
            payload[AbpClaimTypes.Role] = distinctRoles[0];
        }
        else if (distinctRoles.Length > 1)
        {
            payload[ClaimTypes.Role] = distinctRoles;
            payload[AbpClaimTypes.Role] = distinctRoles;
        }

        var encodedHeader = Base64UrlEncoder.Encode(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(header)));
        var encodedPayload = Base64UrlEncoder.Encode(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(payload)));
        var unsignedToken = encodedHeader + "." + encodedPayload;

        using var hmac = new HMACSHA256(options.GetSigningKeyBytes());
        var signature = hmac.ComputeHash(Encoding.UTF8.GetBytes(unsignedToken));

        return unsignedToken + "." + Base64UrlEncoder.Encode(signature);
    }

    private static long ToUnixTimeSeconds(DateTime value)
    {
        return new DateTimeOffset(DateTime.SpecifyKind(value, DateTimeKind.Utc)).ToUnixTimeSeconds();
    }
}

public record PortfolioAdminAccessTokenResult(string AccessToken, DateTime ExpiresAtUtc);
