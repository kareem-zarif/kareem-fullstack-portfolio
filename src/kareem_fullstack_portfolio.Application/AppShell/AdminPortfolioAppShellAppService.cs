using System.Linq;
using System.Threading.Tasks;
using kareem_fullstack_portfolio.Permissions;
using Microsoft.AspNetCore.Authorization;

namespace kareem_fullstack_portfolio.AppShell;

[Authorize(kareem_fullstack_portfolioPermissions.Admin.Access)]
public class AdminPortfolioAppShellAppService : PortfolioAppShellAppServiceBase, IAdminPortfolioAppShellAppService
{
    public AdminPortfolioAppShellAppService(IPortfolioAppShellDefinitionProvider appShellDefinitionProvider)
        : base(appShellDefinitionProvider)
    {
    }

    public Task<PortfolioAppShellDto> GetAsync()
    {
        var definition = GetDefinition();
        var routes = definition.Routes
            .Where(route => route.Layout == PortfolioLayoutType.Admin && route.RequiresAuthentication)
            .OrderBy(route => route.DisplayOrder)
            .ToList();

        return Task.FromResult(CreateShellDto(definition, PortfolioLayoutType.Admin, routes));
    }
}
