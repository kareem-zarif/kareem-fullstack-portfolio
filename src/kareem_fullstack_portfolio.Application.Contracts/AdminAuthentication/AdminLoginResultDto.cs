using System;

namespace kareem_fullstack_portfolio.AdminAuthentication;

public class AdminLoginResultDto
{
    public string AccessToken { get; set; } = string.Empty;

    public string TokenType { get; set; } = "Bearer";

    public int ExpiresInSeconds { get; set; }

    public DateTime ExpiresAtUtc { get; set; }

    public AdminCurrentUserDto User { get; set; } = new();
}
