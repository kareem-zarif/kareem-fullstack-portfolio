using System.ComponentModel.DataAnnotations;

namespace kareem_fullstack_portfolio.Projects;

public class SetPortfolioProjectFeaturedStatusDto
{
    [Required]
    public bool IsFeatured { get; set; }
}
