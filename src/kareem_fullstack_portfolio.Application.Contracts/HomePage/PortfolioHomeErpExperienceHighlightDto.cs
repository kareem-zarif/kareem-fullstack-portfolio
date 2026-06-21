using System.Collections.Generic;
using kareem_fullstack_portfolio.Projects;

namespace kareem_fullstack_portfolio.HomePage;

public class PortfolioHomeErpExperienceHighlightDto
{
    public string Headline { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;

    public List<PortfolioHomeErpCapabilityDto> Capabilities { get; set; } = [];

    public string ArchitectureNote { get; set; } = string.Empty;

    public List<PortfolioProjectCaseStudyHighlightCardDto> HighlightCards { get; set; } = [];

    public string ProjectRoute { get; set; } = string.Empty;
}
