using System.Collections.Generic;

namespace kareem_fullstack_portfolio.HomePage;

public class PortfolioHomeErpExperienceHighlightDto
{
    public string Headline { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;

    public List<PortfolioHomeErpCapabilityDto> Capabilities { get; set; } = [];

    public string ArchitectureNote { get; set; } = string.Empty;

    public string ProjectRoute { get; set; } = string.Empty;
}
