using System.ComponentModel.DataAnnotations;

namespace kareem_fullstack_portfolio.Projects;

public class CreateUpdatePortfolioProjectCaseStudyGalleryItemDto
{
    [Required]
    public PortfolioProjectCaseStudyGalleryItemType Type { get; set; }

    [Required]
    [StringLength(PortfolioProjectCaseStudyConsts.MaxGalleryTitleLength)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(PortfolioProjectCaseStudyConsts.MaxGallerySummaryLength)]
    public string Summary { get; set; } = string.Empty;

    [StringLength(PortfolioProjectCaseStudyConsts.MaxGalleryImageUrlLength)]
    public string? ImageUrl { get; set; }

    [Range(0, int.MaxValue)]
    public int DisplayOrder { get; set; }
}
