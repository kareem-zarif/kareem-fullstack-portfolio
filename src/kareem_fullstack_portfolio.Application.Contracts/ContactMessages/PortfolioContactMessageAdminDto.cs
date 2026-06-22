using System;

namespace kareem_fullstack_portfolio.ContactMessages;

public class PortfolioContactMessageAdminDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? Company { get; set; }

    public string Subject { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public bool IsRead { get; set; }

    public PortfolioContactMessageStatus Status { get; set; }

    public string StatusLabel { get; set; } = string.Empty;

    public DateTime CreationTime { get; set; }

    public DateTime? ReadTime { get; set; }

    public bool IsArchived { get; set; }

    public DateTime? ArchivedTime { get; set; }
}
