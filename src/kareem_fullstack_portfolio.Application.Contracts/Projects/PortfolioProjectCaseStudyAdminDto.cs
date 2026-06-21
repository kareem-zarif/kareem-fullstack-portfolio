using System.Collections.Generic;

namespace kareem_fullstack_portfolio.Projects;

public class PortfolioProjectCaseStudyAdminDto
{
    public string Overview { get; set; } = string.Empty;

    public string BusinessProblem { get; set; } = string.Empty;

    public string Solution { get; set; } = string.Empty;

    public string RoleSummary { get; set; } = string.Empty;

    public List<string> RoleResponsibilities { get; set; } = [];

    public List<string> KeyFeatures { get; set; } = [];

    public List<string> ArchitectureNotes { get; set; } = [];

    public List<PortfolioProjectCaseStudyHighlightCardDto> HighlightCards { get; set; } = [];

    public List<PortfolioProjectCaseStudyGalleryItemDto> GalleryItems { get; set; } = [];

    public List<string> Results { get; set; } = [];
}
