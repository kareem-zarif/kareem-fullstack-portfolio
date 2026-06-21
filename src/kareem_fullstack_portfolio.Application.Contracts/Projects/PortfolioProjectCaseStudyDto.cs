using System;
using System.Collections.Generic;

namespace kareem_fullstack_portfolio.Projects;

public class PortfolioProjectCaseStudyDto
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string CaseStudyRoute { get; set; } = string.Empty;

    public PortfolioProjectType ProjectType { get; set; }

    public string ProjectTypeLabel { get; set; } = string.Empty;

    public string ShortSummary { get; set; } = string.Empty;

    public string BusinessValue { get; set; } = string.Empty;

    public string Overview { get; set; } = string.Empty;

    public string BusinessProblem { get; set; } = string.Empty;

    public string Solution { get; set; } = string.Empty;

    public string RoleSummary { get; set; } = string.Empty;

    public List<string> RoleResponsibilities { get; set; } = [];

    public List<string> TechStack { get; set; } = [];

    public List<string> KeyFeatures { get; set; } = [];

    public List<string> ArchitectureNotes { get; set; } = [];

    public List<PortfolioProjectCaseStudyHighlightCardDto> HighlightCards { get; set; } = [];

    public List<PortfolioProjectCaseStudyGalleryItemDto> GalleryItems { get; set; } = [];

    public List<string> Results { get; set; } = [];

    public List<PortfolioProjectCaseStudyLinkDto> Links { get; set; } = [];

    public List<PortfolioProjectCaseStudySectionDto> Sections { get; set; } = [];

    public bool IsFeatured { get; set; }
}
