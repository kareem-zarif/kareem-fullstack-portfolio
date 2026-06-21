using kareem_fullstack_portfolio.AppShell;

namespace kareem_fullstack_portfolio.Dashboard;

public class AdminDashboardQuickActionDto
{
    public PortfolioRouteType RouteType { get; set; }

    public string Label { get; set; } = string.Empty;

    public string Path { get; set; } = string.Empty;

    public string RequiredPermissionName { get; set; } = string.Empty;

    public int DisplayOrder { get; set; }
}
