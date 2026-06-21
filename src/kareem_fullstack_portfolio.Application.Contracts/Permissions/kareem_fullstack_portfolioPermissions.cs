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

    public static class Dashboard
    {
        public const string Default = PortfolioAppShellAuthorizationNames.Dashboard;
    }

    public static class Projects
    {
        public const string Default = PortfolioAppShellAuthorizationNames.Projects;
        public const string Manage = Default + ".Manage";
    }

    public static class Skills
    {
        public const string Default = PortfolioAppShellAuthorizationNames.Skills;
        public const string Manage = Default + ".Manage";
    }

    public static class Experience
    {
        public const string Default = PortfolioAppShellAuthorizationNames.Experience;
        public const string Manage = Default + ".Manage";
    }

    public static class Messages
    {
        public const string Default = PortfolioAppShellAuthorizationNames.Messages;
        public const string Manage = Default + ".Manage";
    }
}
