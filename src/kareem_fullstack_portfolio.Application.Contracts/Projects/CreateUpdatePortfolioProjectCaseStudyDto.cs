using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace kareem_fullstack_portfolio.Projects;

public class CreateUpdatePortfolioProjectCaseStudyDto
{
    [Required]
    [StringLength(PortfolioProjectCaseStudyConsts.SectionTextMaxLength)]
    public string Overview { get; set; } = string.Empty;

    [Required]
    [StringLength(PortfolioProjectCaseStudyConsts.SectionTextMaxLength)]
    public string BusinessProblem { get; set; } = string.Empty;

    [Required]
    [StringLength(PortfolioProjectCaseStudyConsts.SectionTextMaxLength)]
    public string Solution { get; set; } = string.Empty;

    [Required]
    [StringLength(PortfolioProjectCaseStudyConsts.SectionTextMaxLength)]
    public string RoleSummary { get; set; } = string.Empty;

    [Required]
    public List<string> RoleResponsibilities { get; set; } = [];

    public List<string> KeyFeatures { get; set; } = [];

    public List<string> ArchitectureNotes { get; set; } = [];

    public List<CreateUpdatePortfolioProjectCaseStudyHighlightCardDto> HighlightCards { get; set; } = [];

    public List<CreateUpdatePortfolioProjectCaseStudyGalleryItemDto> GalleryItems { get; set; } = [];

    [Required]
    public List<string> Results { get; set; } = [];
}
