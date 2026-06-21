using System.Collections.Generic;

namespace kareem_fullstack_portfolio.Projects;

public class PortfolioProjectListDto
{
    public List<PortfolioProjectCardDto> Items { get; set; } = [];

    public List<PortfolioProjectTypeFilterOptionDto> AvailableProjectTypes { get; set; } = [];

    public List<string> AvailableTechnologies { get; set; } = [];

    public PortfolioProjectType? AppliedProjectType { get; set; }

    public string? AppliedTechnology { get; set; }

    public bool HasActiveFilters { get; set; }
}
