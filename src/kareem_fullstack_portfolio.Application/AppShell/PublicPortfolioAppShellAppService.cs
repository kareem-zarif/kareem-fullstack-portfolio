using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace kareem_fullstack_portfolio.AppShell;

[AllowAnonymous]
public class PublicPortfolioAppShellAppService : PortfolioAppShellAppServiceBase, IPublicPortfolioAppShellAppService
{
    public PublicPortfolioAppShellAppService(IPortfolioAppShellDefinitionProvider appShellDefinitionProvider)
        : base(appShellDefinitionProvider)
    {
    }

    public Task<PortfolioAppShellDto> GetAsync()
    {
        var definition = GetDefinition();
        var routes = definition.Routes
            .Where(route => route.Layout == PortfolioLayoutType.Public || route.Type == PortfolioRouteType.AdminLogin)
            .OrderBy(route => route.DisplayOrder)
            .ToList();

        return Task.FromResult(CreateShellDto(definition, PortfolioLayoutType.Public, routes));
    }
}
