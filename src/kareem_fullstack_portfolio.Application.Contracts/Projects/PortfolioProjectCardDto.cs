using System;
using System.Collections.Generic;

namespace kareem_fullstack_portfolio.Projects;

public class PortfolioProjectCardDto
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public PortfolioProjectType ProjectType { get; set; }

    public string ProjectTypeLabel { get; set; } = string.Empty;

    public string ShortSummary { get; set; } = string.Empty;

    public string ShortSummaryPreview { get; set; } = string.Empty;

    public bool IsShortSummaryTruncated { get; set; }

    public string BusinessValue { get; set; } = string.Empty;

    public string BusinessValuePreview { get; set; } = string.Empty;

    public bool IsBusinessValueTruncated { get; set; }

    public List<string> TechStack { get; set; } = [];

    public bool IsFeatured { get; set; }

    public string? GitHubUrl { get; set; }

    public bool HasGitHubLink { get; set; }

    public string? GitHubFrontendUrl { get; set; }

    public bool HasGitHubFrontendLink { get; set; }

    public string? LiveDemoUrl { get; set; }

    public bool HasLiveDemoLink { get; set; }

    public string CaseStudyRoute { get; set; } = string.Empty;

    public bool HasCaseStudyLink { get; set; }

    public int DisplayOrder { get; set; }
}
