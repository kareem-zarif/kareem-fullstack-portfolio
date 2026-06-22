using System.Collections.Generic;

namespace kareem_fullstack_portfolio.ContactMessages;

public class AdminPortfolioContactMessageListDto
{
    public List<PortfolioContactMessageAdminListItemDto> Items { get; set; } = [];

    public string? AppliedSearchText { get; set; }

    public bool AppliedIsUnreadOnly { get; set; }

    public int TotalCount { get; set; }
}
