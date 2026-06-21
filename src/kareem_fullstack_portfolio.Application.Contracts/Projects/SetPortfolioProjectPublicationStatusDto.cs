using System.ComponentModel.DataAnnotations;

namespace kareem_fullstack_portfolio.Projects;

public class SetPortfolioProjectPublicationStatusDto
{
    [Required]
    public bool IsActive { get; set; }
}
