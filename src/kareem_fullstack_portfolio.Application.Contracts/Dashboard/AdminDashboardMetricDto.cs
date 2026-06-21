namespace kareem_fullstack_portfolio.Dashboard;

public class AdminDashboardMetricDto
{
    public PortfolioAdminDashboardMetricType Type { get; set; }

    public string Label { get; set; } = string.Empty;

    public long Value { get; set; }

    public string RequiredPermissionName { get; set; } = string.Empty;

    public int DisplayOrder { get; set; }
}
