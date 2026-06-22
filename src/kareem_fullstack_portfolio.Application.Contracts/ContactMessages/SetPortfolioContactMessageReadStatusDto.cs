using System.ComponentModel.DataAnnotations;

namespace kareem_fullstack_portfolio.ContactMessages;

public class SetPortfolioContactMessageReadStatusDto
{
    [Required]
    public bool IsRead { get; set; }
}
