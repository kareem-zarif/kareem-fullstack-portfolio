using System;
using System.Collections.Generic;

namespace kareem_fullstack_portfolio.Dashboard;

public class AdminDashboardOverviewDto
{
    public DateTime GeneratedAtUtc { get; set; }

    public bool HasRecentMessages { get; set; }

    public IReadOnlyList<AdminDashboardMetricDto> Metrics { get; set; } = Array.Empty<AdminDashboardMetricDto>();

    public IReadOnlyList<AdminDashboardRecentMessageDto> RecentMessages { get; set; } = Array.Empty<AdminDashboardRecentMessageDto>();

    public IReadOnlyList<AdminDashboardQuickActionDto> QuickActions { get; set; } = Array.Empty<AdminDashboardQuickActionDto>();
}
