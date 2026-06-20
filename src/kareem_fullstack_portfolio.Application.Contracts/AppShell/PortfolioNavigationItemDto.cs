namespace kareem_fullstack_portfolio.AppShell;

public class PortfolioNavigationItemDto
{
    public PortfolioRouteType RouteType { get; set; }

    public string Label { get; set; } = string.Empty;

    public string Path { get; set; } = string.Empty;

    public bool ExactMatch { get; set; }

    public int DisplayOrder { get; set; }
}
