using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace kareem_fullstack_portfolio.Projects;

public class CreateUpdatePortfolioProjectDto
{
    [Required]
    [StringLength(PortfolioProjectConsts.MaxTitleLength)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(PortfolioProjectConsts.MaxSlugLength)]
    public string Slug { get; set; } = string.Empty;

    [Required]
    public PortfolioProjectType ProjectType { get; set; }

    [Required]
    [StringLength(PortfolioProjectConsts.MaxShortSummaryLength)]
    public string ShortSummary { get; set; } = string.Empty;

    [Required]
    [StringLength(PortfolioProjectConsts.MaxBusinessValueLength)]
    public string BusinessValue { get; set; } = string.Empty;

    [Required]
    [MinLength(1)]
    public List<string> TechStack { get; set; } = [];

    public bool IsFeatured { get; set; }

    public bool IsActive { get; set; } = true;

    [StringLength(PortfolioProjectConsts.MaxUrlLength)]
    public string? GitHubUrl { get; set; }

    [StringLength(PortfolioProjectConsts.MaxUrlLength)]
    public string? GitHubFrontendUrl { get; set; }

    [StringLength(PortfolioProjectConsts.MaxUrlLength)]
    public string? LiveDemoUrl { get; set; }

    [Range(0, int.MaxValue)]
    public int DisplayOrder { get; set; }

    [Required]
    public CreateUpdatePortfolioProjectCaseStudyDto CaseStudy { get; set; } = new();
}
