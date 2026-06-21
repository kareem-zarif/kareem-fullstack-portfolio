using System.Collections.Generic;
using System.Linq;

namespace kareem_fullstack_portfolio.Projects;

public class PortfolioProjectCaseStudyContent
{
    public string Overview { get; set; } = string.Empty;

    public string BusinessProblem { get; set; } = string.Empty;

    public string Solution { get; set; } = string.Empty;

    public string RoleSummary { get; set; } = string.Empty;

    public List<string> RoleResponsibilities { get; set; } = [];

    public List<string> KeyFeatures { get; set; } = [];

    public List<string> ArchitectureNotes { get; set; } = [];

    public List<PortfolioProjectCaseStudyHighlightCardContent> HighlightCards { get; set; } = [];

    public List<PortfolioProjectCaseStudyGalleryItemContent> GalleryItems { get; set; } = [];

    public List<string> Results { get; set; } = [];

    public PortfolioProjectCaseStudyDefinition ToDefinition(string slug)
    {
        var definition = new PortfolioProjectCaseStudyDefinition(
            slug,
            Overview,
            BusinessProblem,
            Solution,
            RoleSummary,
            RoleResponsibilities ?? [],
            KeyFeatures ?? [],
            ArchitectureNotes ?? [],
            (HighlightCards ?? [])
                .Select(card => card.ToDefinition())
                .ToList(),
            (GalleryItems ?? [])
                .Select(item => item.ToDefinition())
                .ToList(),
            Results ?? []);

        definition.EnsureValid();

        return definition;
    }

    public static PortfolioProjectCaseStudyContent FromDefinition(PortfolioProjectCaseStudyDefinition definition)
    {
        return new PortfolioProjectCaseStudyContent
        {
            Overview = definition.Overview,
            BusinessProblem = definition.BusinessProblem,
            Solution = definition.Solution,
            RoleSummary = definition.RoleSummary,
            RoleResponsibilities = definition.RoleResponsibilities.ToList(),
            KeyFeatures = definition.KeyFeatures.ToList(),
            ArchitectureNotes = definition.ArchitectureNotes.ToList(),
            HighlightCards = definition.HighlightCards
                .Select(PortfolioProjectCaseStudyHighlightCardContent.FromDefinition)
                .ToList(),
            GalleryItems = definition.GalleryItems
                .Select(PortfolioProjectCaseStudyGalleryItemContent.FromDefinition)
                .ToList(),
            Results = definition.Results.ToList()
        };
    }
}
