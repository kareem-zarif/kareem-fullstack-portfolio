using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using kareem_fullstack_portfolio.Permissions;
using Microsoft.AspNetCore.Authorization;

namespace kareem_fullstack_portfolio.AppShell;

public class PortfolioAppShellAppService : kareem_fullstack_portfolioAppService, IPortfolioAppShellAppService
{
    private readonly IPortfolioAppShellDefinitionProvider _appShellDefinitionProvider;

    public PortfolioAppShellAppService(IPortfolioAppShellDefinitionProvider appShellDefinitionProvider)
    {
        _appShellDefinitionProvider = appShellDefinitionProvider;
    }

    [AllowAnonymous]
    public Task<PortfolioAppShellDto> GetPublicAsync()
    {
        var definition = _appShellDefinitionProvider.Get();
        var routes = definition.Routes
            .Where(route => route.Layout == PortfolioLayoutType.Public || route.Type == PortfolioRouteType.AdminLogin)
            .OrderBy(route => route.DisplayOrder)
            .ToList();

        return Task.FromResult(CreateShellDto(definition, PortfolioLayoutType.Public, routes));
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Admin.Access)]
    public Task<PortfolioAppShellDto> GetAdminAsync()
    {
        var definition = _appShellDefinitionProvider.Get();
        var routes = definition.Routes
            .Where(route => route.Layout == PortfolioLayoutType.Admin && route.RequiresAuthentication)
            .OrderBy(route => route.DisplayOrder)
            .ToList();

        return Task.FromResult(CreateShellDto(definition, PortfolioLayoutType.Admin, routes));
    }

    private PortfolioAppShellDto CreateShellDto(
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
