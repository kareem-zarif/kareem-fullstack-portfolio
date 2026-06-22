using System;

namespace kareem_fullstack_portfolio.ContactMessages;

public class PortfolioContactMessageAdminListItemDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? Company { get; set; }

    public string Subject { get; set; } = string.Empty;

    public string MessagePreview { get; set; } = string.Empty;

    public bool IsMessagePreviewTruncated { get; set; }

    public bool IsRead { get; set; }

    public PortfolioContactMessageStatus Status { get; set; }

    public string StatusLabel { get; set; } = string.Empty;

    public DateTime CreationTime { get; set; }
}
