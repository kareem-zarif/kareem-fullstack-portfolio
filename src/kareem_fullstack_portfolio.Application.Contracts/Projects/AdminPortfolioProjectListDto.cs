using System.Collections.Generic;

namespace kareem_fullstack_portfolio.Projects;

public class AdminPortfolioProjectListDto
{
    public List<PortfolioProjectAdminListItemDto> Items { get; set; } = [];

    public List<PortfolioProjectTypeFilterOptionDto> AvailableProjectTypes { get; set; } = [];

    public string? AppliedSearchText { get; set; }

    public PortfolioProjectType? AppliedProjectType { get; set; }

    public bool? AppliedIsActive { get; set; }

    public bool? AppliedIsFeatured { get; set; }

    public int TotalCount { get; set; }
}
