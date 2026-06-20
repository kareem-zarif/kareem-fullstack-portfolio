using System.Collections.Generic;
using Volo.Abp.DependencyInjection;

namespace kareem_fullstack_portfolio.AppShell;

public class PortfolioAppShellDefinitionProvider : IPortfolioAppShellDefinitionProvider, ITransientDependency
{
    public PortfolioAppShellDefinition Get()
    {
        var definition = new PortfolioAppShellDefinition(
            brandName: "Kareem Zarif",
            routes: new List<PortfolioRouteDefinition>
            {
                new(PortfolioRouteType.Home, "/", PortfolioLayoutType.Public, false, null, true, true, 1),
                new(PortfolioRouteType.Projects, "/projects", PortfolioLayoutType.Public, false, null, true, true, 2),
                new(PortfolioRouteType.ProjectDetails, "/projects/:slug", PortfolioLayoutType.Public, false, null, false, false, 3),
                new(PortfolioRouteType.Experience, "/experience", PortfolioLayoutType.Public, false, null, true, true, 4),
                new(PortfolioRouteType.Contact, "/contact", PortfolioLayoutType.Public, false, null, true, true, 5),
                new(PortfolioRouteType.AdminLogin, "/admin/login", PortfolioLayoutType.Admin, false, null, false, true, 100),
                new(PortfolioRouteType.AdminDashboard, "/admin/dashboard", PortfolioLayoutType.Admin, true, PortfolioAppShellAuthorizationNames.AdminAccess, true, true, 101),
                new(PortfolioRouteType.AdminProjects, "/admin/projects", PortfolioLayoutType.Admin, true, PortfolioAppShellAuthorizationNames.AdminAccess, true, true, 102),
                new(PortfolioRouteType.AdminSkills, "/admin/skills", PortfolioLayoutType.Admin, true, PortfolioAppShellAuthorizationNames.AdminAccess, true, true, 103),
                new(PortfolioRouteType.AdminExperience, "/admin/experience", PortfolioLayoutType.Admin, true, PortfolioAppShellAuthorizationNames.AdminAccess, true, true, 104),
                new(PortfolioRouteType.AdminMessages, "/admin/messages", PortfolioLayoutType.Admin, true, PortfolioAppShellAuthorizationNames.AdminAccess, true, true, 105),
                new(PortfolioRouteType.NotFound, "**", PortfolioLayoutType.Public, false, null, false, false, 999)
            },
            footerLinks: new List<PortfolioFooterLinkDefinition>
            {
                new(PortfolioFooterLinkType.GitHub, string.Empty, true, 1),
                new(PortfolioFooterLinkType.LinkedIn, string.Empty, true, 2),
                new(PortfolioFooterLinkType.Email, string.Empty, true, 3),
                new(PortfolioFooterLinkType.CvDownload, "/assets/kareem-zarif-cv.pdf", false, 4)
            });

        definition.EnsureValid();

        return definition;
    }
}
