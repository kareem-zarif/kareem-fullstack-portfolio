using System.Collections.Generic;

namespace kareem_fullstack_portfolio.HomePage;

public class PortfolioHomeErpExperienceHighlightDefinition
{
    public string Headline { get; }

    public string Summary { get; }

    public IReadOnlyList<PortfolioHomeErpCapabilityType> Capabilities { get; }

    public string ArchitectureNote { get; }

    public string ProjectRoute { get; }

    public PortfolioHomeErpExperienceHighlightDefinition(
        string headline,
        string summary,
        IReadOnlyList<PortfolioHomeErpCapabilityType> capabilities,
        string architectureNote,
        string projectRoute)
    {
        Headline = headline;
        Summary = summary;
        Capabilities = capabilities;
        ArchitectureNote = architectureNote;
        ProjectRoute = projectRoute;
    }
}
