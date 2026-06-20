using System.Collections.Generic;

namespace kareem_fullstack_portfolio.HomePage;

public class PortfolioHomeFeaturedProjectDto
{
    public PortfolioHomeFeaturedProjectType Type { get; set; }

    public string TypeLabel { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string ShortSummary { get; set; } = string.Empty;

    public string BusinessValue { get; set; } = string.Empty;

    public List<string> TechStack { get; set; } = [];

    public string? GitHubUrl { get; set; }

    public bool HasGitHubLink { get; set; }

    public string? LiveDemoUrl { get; set; }

    public bool HasLiveDemoLink { get; set; }

    public string CaseStudyRoute { get; set; } = string.Empty;

    public bool IsFeatured { get; set; }

    public int DisplayOrder { get; set; }
}
