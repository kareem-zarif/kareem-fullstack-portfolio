using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace kareem_fullstack_portfolio.Experience;

public class CreateUpdatePortfolioExperienceDto
{
    [Required]
    public PortfolioExperienceTimelineItemType Type { get; set; }

    [Required]
    [StringLength(PortfolioExperienceConsts.MaxStageLabelLength)]
    public string StageLabel { get; set; } = string.Empty;

    [Required]
    [StringLength(PortfolioExperienceConsts.MaxTitleLength)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(PortfolioExperienceConsts.MaxOrganizationLength)]
    public string Organization { get; set; } = string.Empty;

    [Required]
    [StringLength(PortfolioExperienceConsts.MaxSummaryLength)]
    public string Summary { get; set; } = string.Empty;

    [Required]
    [StringLength(PortfolioExperienceConsts.MaxBusinessValueLength)]
    public string BusinessValue { get; set; } = string.Empty;

    [Required]
    [MinLength(1)]
    public List<string> Highlights { get; set; } = [];

    public bool IsPrimaryProfessionalExperience { get; set; }

    public bool IsActive { get; set; } = true;

    [Range(0, int.MaxValue)]
    public int DisplayOrder { get; set; }
}
