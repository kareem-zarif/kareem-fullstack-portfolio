namespace kareem_fullstack_portfolio.AppShell;

public class PortfolioRouteDto
{
    public PortfolioRouteType Type { get; set; }

    public string Label { get; set; } = string.Empty;

    public string Path { get; set; } = string.Empty;

    public PortfolioLayoutType Layout { get; set; }

    public string LayoutLabel { get; set; } = string.Empty;

    public bool RequiresAuthentication { get; set; }

    public string? RequiredPermissionName { get; set; }

    public bool IsNavigationVisible { get; set; }

    public bool ExactMatch { get; set; }

    public int DisplayOrder { get; set; }
}
