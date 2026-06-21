namespace kareem_fullstack_portfolio.AdminAuthentication;

public static class PortfolioAdminAuthenticationDefaults
{
    public const string AuthenticationScheme = "PortfolioAdminBearer";
    public const string ConfigurationSectionName = "AdminAuthentication";
    public const string DefaultAudience = "kareem_fullstack_portfolio-admin";
    public const int DefaultAccessTokenExpirationMinutes = 120;
}
