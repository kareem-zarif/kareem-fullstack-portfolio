using System;
using System.Collections.Generic;
using System.Linq;
using Volo.Abp;

namespace kareem_fullstack_portfolio.AppShell;

public class PortfolioAppShellDefinition
{
    public string BrandName { get; }

    public IReadOnlyList<PortfolioRouteDefinition> Routes { get; }

    public IReadOnlyList<PortfolioFooterLinkDefinition> FooterLinks { get; }

    public PortfolioAppShellDefinition(
        string brandName,
        IReadOnlyList<PortfolioRouteDefinition> routes,
        IReadOnlyList<PortfolioFooterLinkDefinition> footerLinks)
    {
        BrandName = brandName;
        Routes = routes;
        FooterLinks = footerLinks;
    }

    public void EnsureValid()
    {
        if (BrandName.IsNullOrWhiteSpace())
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.AppShellBrandNameRequired);
        }

        EnsureRequiredRoutesExist();
        EnsureRoutePathsAreUnique();
        EnsureRouteProtectionRules();
        EnsureNotFoundRoute();
        EnsureFooterLinksExist();
    }

    private void EnsureRequiredRoutesExist()
    {
        foreach (var routeType in Enum.GetValues<PortfolioRouteType>())
        {
            if (Routes.All(route => route.Type != routeType))
            {
                throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.AppShellMissingRequiredRoute)
                    .WithData("RouteType", routeType.ToString());
            }
        }
    }

    private void EnsureRoutePathsAreUnique()
    {
        var duplicatePath = Routes
            .GroupBy(route => route.Path, StringComparer.OrdinalIgnoreCase)
            .FirstOrDefault(group => group.Count() > 1);

        if (duplicatePath != null)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.AppShellDuplicateRoutePath)
                .WithData("RoutePath", duplicatePath.Key);
        }
    }

    private void EnsureRouteProtectionRules()
    {
        foreach (var route in Routes)
        {
            if (route.Layout == PortfolioLayoutType.Admin &&
                route.Type != PortfolioRouteType.AdminLogin &&
                !route.RequiresAuthentication)
            {
                throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.AppShellAdminRouteMustBeProtected)
                    .WithData("RouteType", route.Type.ToString());
            }

            if (route.Layout == PortfolioLayoutType.Admin &&
                route.Type != PortfolioRouteType.AdminLogin &&
                route.RequiredPermissionName.IsNullOrWhiteSpace())
            {
                throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.AppShellAdminRouteMissingPermission)
                    .WithData("RouteType", route.Type.ToString());
            }

            if (route.Layout == PortfolioLayoutType.Public && route.RequiresAuthentication)
            {
                throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.AppShellPublicRouteMustNotRequireAuthentication)
                    .WithData("RouteType", route.Type.ToString());
            }
        }
    }

    private void EnsureNotFoundRoute()
    {
        var notFoundRoute = Routes.Single(route => route.Type == PortfolioRouteType.NotFound);

        if (notFoundRoute.Path != "**" || notFoundRoute.RequiresAuthentication)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.AppShellNotFoundRouteInvalid);
        }
    }

    private void EnsureFooterLinksExist()
    {
        foreach (var footerLinkType in Enum.GetValues<PortfolioFooterLinkType>())
        {
            if (FooterLinks.All(link => link.Type != footerLinkType))
            {
                throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.AppShellMissingFooterLink)
                    .WithData("FooterLinkType", footerLinkType.ToString());
            }
        }
    }
}
