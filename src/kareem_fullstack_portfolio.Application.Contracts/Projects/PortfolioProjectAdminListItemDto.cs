using System;
using System.Collections.Generic;

namespace kareem_fullstack_portfolio.Projects;

public class PortfolioProjectAdminListItemDto
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public PortfolioProjectType ProjectType { get; set; }

    public string ProjectTypeLabel { get; set; } = string.Empty;

    public string ShortSummaryPreview { get; set; } = string.Empty;

    public bool IsShortSummaryTruncated { get; set; }

    public string BusinessValuePreview { get; set; } = string.Empty;

    public bool IsBusinessValueTruncated { get; set; }

    public List<string> TechStack { get; set; } = [];

    public bool IsFeatured { get; set; }

    public bool IsActive { get; set; }

    public bool HasCaseStudyContent { get; set; }

    public string CaseStudyRoute { get; set; } = string.Empty;

    public int DisplayOrder { get; set; }
}
