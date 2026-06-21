using System;

namespace kareem_fullstack_portfolio.Dashboard;

public class AdminDashboardRecentMessageDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? Company { get; set; }

    public string Subject { get; set; } = string.Empty;

    public string MessagePreview { get; set; } = string.Empty;

    public bool IsRead { get; set; }

    public DateTime CreationTime { get; set; }
}
