using System.Collections.Generic;
using System.Linq;

namespace kareem_fullstack_portfolio.AppShell;

public abstract class PortfolioAppShellAppServiceBase : kareem_fullstack_portfolioAppService
{
    private readonly IPortfolioAppShellDefinitionProvider _appShellDefinitionProvider;

    protected PortfolioAppShellAppServiceBase(IPortfolioAppShellDefinitionProvider appShellDefinitionProvider)
    {
        _appShellDefinitionProvider = appShellDefinitionProvider;
    }

    protected PortfolioAppShellDefinition GetDefinition()
    {
        return _appShellDefinitionProvider.Get();
    }

    protected PortfolioAppShellDto CreateShellDto(
        PortfolioAppShellDefinition definition,
        PortfolioLayoutType layout,
        IReadOnlyList<PortfolioRouteDefinition> routes)
    {
        return new PortfolioAppShellDto
        {
            BrandName = definition.BrandName,
            Layout = CreateLayoutDto(layout),
            Routes = routes.Select(CreateRouteDto).ToList(),
            NavigationItems = routes
                .Where(route => route.IsNavigationVisible)
                .OrderBy(route => route.DisplayOrder)
                .Select(CreateNavigationItemDto)
                .ToList(),
            FooterLinks = layout == PortfolioLayoutType.Public
                ? definition.FooterLinks
                    .OrderBy(link => link.DisplayOrder)
                    .Select(CreateFooterLinkDto)
                    .ToList()
                : []
        };
    }

    private PortfolioLayoutDto CreateLayoutDto(PortfolioLayoutType layout)
    {
        return new PortfolioLayoutDto
        {
            Type = layout,
            Label = L[$"Enum:PortfolioLayoutType.{layout}"],
            IsAdmin = layout == PortfolioLayoutType.Admin
        };
    }

    private PortfolioRouteDto CreateRouteDto(PortfolioRouteDefinition route)
    {
        return new PortfolioRouteDto
        {
            Type = route.Type,
            Label = L[$"Enum:PortfolioRouteType.{route.Type}"],
            Path = route.Path,
            Layout = route.Layout,
            LayoutLabel = L[$"Enum:PortfolioLayoutType.{route.Layout}"],
            RequiresAuthentication = route.RequiresAuthentication,
            RequiredPermissionName = route.RequiredPermissionName,
            IsNavigationVisible = route.IsNavigationVisible,
            ExactMatch = route.ExactMatch,
            DisplayOrder = route.DisplayOrder
        };
    }

    private PortfolioNavigationItemDto CreateNavigationItemDto(PortfolioRouteDefinition route)
    {
        return new PortfolioNavigationItemDto
        {
            RouteType = route.Type,
            Label = L[$"Enum:PortfolioRouteType.{route.Type}"],
            Path = route.Path,
            ExactMatch = route.ExactMatch,
            DisplayOrder = route.DisplayOrder
        };
    }

    private PortfolioFooterLinkDto CreateFooterLinkDto(PortfolioFooterLinkDefinition link)
    {
        return new PortfolioFooterLinkDto
        {
            Type = link.Type,
            Label = L[$"Enum:PortfolioFooterLinkType.{link.Type}"],
            Url = link.Url,
            IsExternal = link.IsExternal,
            IsConfigured = !string.IsNullOrWhiteSpace(link.Url),
            DisplayOrder = link.DisplayOrder
        };
    }
}
