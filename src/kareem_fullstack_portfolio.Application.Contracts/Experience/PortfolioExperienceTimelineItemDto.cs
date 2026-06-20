using System.Collections.Generic;

namespace kareem_fullstack_portfolio.Experience;

public class PortfolioExperienceTimelineItemDto
{
    public PortfolioExperienceTimelineItemType Type { get; set; }

    public string TypeLabel { get; set; } = string.Empty;

    public string StageLabel { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Organization { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;

    public string BusinessValue { get; set; } = string.Empty;

    public List<string> Highlights { get; set; } = [];

    public bool IsPrimaryProfessionalExperience { get; set; }

    public int DisplayOrder { get; set; }
}
