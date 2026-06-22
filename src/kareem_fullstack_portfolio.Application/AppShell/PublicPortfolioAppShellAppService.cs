using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace kareem_fullstack_portfolio.AppShell;

[AllowAnonymous]
[Route("api/app/public-portfolio-app-shell")]
public class PublicPortfolioAppShellAppService : PortfolioAppShellAppServiceBase, IPublicPortfolioAppShellAppService
{
    public PublicPortfolioAppShellAppService(IPortfolioAppShellDefinitionProvider appShellDefinitionProvider)
        : base(appShellDefinitionProvider)
    {
    }

    [HttpGet]
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
