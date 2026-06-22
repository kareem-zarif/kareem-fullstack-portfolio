using System.ComponentModel.DataAnnotations;

namespace kareem_fullstack_portfolio.ContactMessages;

public class GetAdminPortfolioContactMessageListInput
{
    [StringLength(PortfolioAdminContactMessageConsts.SearchTextMaxLength)]
    public string? SearchText { get; set; }

    public bool IsUnreadOnly { get; set; }
}
