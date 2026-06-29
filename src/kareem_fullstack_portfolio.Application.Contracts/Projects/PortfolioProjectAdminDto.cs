using System;
using System.Collections.Generic;

namespace kareem_fullstack_portfolio.Projects;

public class PortfolioProjectAdminDto
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public PortfolioProjectType ProjectType { get; set; }

    public string ProjectTypeLabel { get; set; } = string.Empty;

    public string ShortSummary { get; set; } = string.Empty;

    public string BusinessValue { get; set; } = string.Empty;

    public List<string> TechStack { get; set; } = [];

    public bool IsFeatured { get; set; }

    public bool IsActive { get; set; }

    public string? GitHubUrl { get; set; }

    public string? GitHubFrontendUrl { get; set; }

    public string? LiveDemoUrl { get; set; }

    public string CaseStudyRoute { get; set; } = string.Empty;

    public bool HasCaseStudyContent { get; set; }

    public int DisplayOrder { get; set; }

    public PortfolioProjectCaseStudyAdminDto CaseStudy { get; set; } = new();
}
