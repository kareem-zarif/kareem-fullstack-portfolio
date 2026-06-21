using System.ComponentModel.DataAnnotations;

namespace kareem_fullstack_portfolio.Projects;

public class CreateUpdatePortfolioProjectCaseStudyHighlightCardDto
{
    [Required]
    public PortfolioProjectCaseStudyHighlightType Type { get; set; }

    [Required]
    [StringLength(PortfolioProjectCaseStudyConsts.MaxHighlightCardTitleLength)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(PortfolioProjectCaseStudyConsts.MaxHighlightCardSummaryLength)]
    public string Summary { get; set; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int DisplayOrder { get; set; }
}
