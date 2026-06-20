using kareem_fullstack_portfolio.AppShell;
using Volo.Abp.Reflection;

namespace kareem_fullstack_portfolio.Permissions;

public static class kareem_fullstack_portfolioPermissions
{
    public const string GroupName = "kareem_fullstack_portfolio";

    public static string[] GetAll()
    {
        return ReflectionHelper.GetPublicConstantsRecursively(typeof(kareem_fullstack_portfolioPermissions));
    }

    public static class Admin
    {
        public const string Access = PortfolioAppShellAuthorizationNames.AdminAccess;
    }

    public static class Skills
    {
        public const string Default = GroupName + ".Skills";
        public const string Manage = Default + ".Manage";
    }
}
