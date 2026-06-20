using kareem_fullstack_portfolio.AppShell;

namespace kareem_fullstack_portfolio.Permissions;

public static class kareem_fullstack_portfolioPermissions
{
    public const string GroupName = "kareem_fullstack_portfolio";

    public static class Admin
    {
        public const string Access = PortfolioAppShellAuthorizationNames.AdminAccess;
    }
}
