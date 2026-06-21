using System;
using System.Text;

namespace kareem_fullstack_portfolio.AdminAuthentication;

public class PortfolioAdminAuthenticationOptions
{
    public string? Issuer { get; set; }

    public string Audience { get; set; } = PortfolioAdminAuthenticationDefaults.DefaultAudience;

    public string SigningKey { get; set; } = string.Empty;

    public int AccessTokenExpirationMinutes { get; set; } = PortfolioAdminAuthenticationDefaults.DefaultAccessTokenExpirationMinutes;

    public byte[] GetSigningKeyBytes()
    {
        if (string.IsNullOrWhiteSpace(SigningKey))
        {
            throw new InvalidOperationException("Admin authentication signing key is not configured.");
        }

        var keyBytes = Encoding.UTF8.GetBytes(SigningKey);
        if (keyBytes.Length < 32)
        {
            throw new InvalidOperationException("Admin authentication signing key must be at least 32 bytes long.");
        }

        return keyBytes;
    }

    public void EnsureValid()
    {
        _ = GetSigningKeyBytes();

        if (string.IsNullOrWhiteSpace(Audience))
        {
            throw new InvalidOperationException("Admin authentication audience is not configured.");
        }

        if (AccessTokenExpirationMinutes <= 0)
        {
            throw new InvalidOperationException("Admin authentication access token expiration must be greater than zero.");
        }
    }
}
