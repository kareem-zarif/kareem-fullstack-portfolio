using System.Collections.Generic;

namespace kareem_fullstack_portfolio.HomePage;

public class PortfolioHomeFeaturedProjectDefinition
{
    public PortfolioHomeFeaturedProjectType Type { get; }

    public string Title { get; }

    public string Slug { get; }

    public string ShortSummary { get; }

    public string BusinessValue { get; }

    public IReadOnlyList<string> TechStack { get; }

    public string? GitHubUrl { get; }

    public string? LiveDemoUrl { get; }

    public string CaseStudyRoute { get; }

    public bool IsFeatured { get; }

    public int DisplayOrder { get; }

    public PortfolioHomeFeaturedProjectDefinition(
        PortfolioHomeFeaturedProjectType type,
        string title,
        string slug,
        string shortSummary,
        string businessValue,
        IReadOnlyList<string> techStack,
        string? gitHubUrl,
        string? liveDemoUrl,
        string caseStudyRoute,
        bool isFeatured,
        int displayOrder)
    {
        Type = type;
        Title = title;
        Slug = slug;
        ShortSummary = shortSummary;
        BusinessValue = businessValue;
        TechStack = techStack;
        GitHubUrl = gitHubUrl;
        LiveDemoUrl = liveDemoUrl;
        CaseStudyRoute = caseStudyRoute;
        IsFeatured = isFeatured;
        DisplayOrder = displayOrder;
    }
}
