using System.Collections.Generic;

namespace kareem_fullstack_portfolio.AppShell;

public class PortfolioAppShellDto
{
    public string BrandName { get; set; } = string.Empty;

    public PortfolioLayoutDto Layout { get; set; } = new();

    public List<PortfolioRouteDto> Routes { get; set; } = [];

    public List<PortfolioNavigationItemDto> NavigationItems { get; set; } = [];

    public List<PortfolioFooterLinkDto> FooterLinks { get; set; } = [];
}
