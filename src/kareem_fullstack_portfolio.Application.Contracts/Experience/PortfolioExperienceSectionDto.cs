using System.Collections.Generic;

namespace kareem_fullstack_portfolio.Experience;

public class PortfolioExperienceSectionDto
{
    public string Headline { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;

    public List<PortfolioExperienceTimelineItemDto> TimelineItems { get; set; } = [];

    public List<PortfolioExperienceHighlightDto> HighlightBadges { get; set; } = [];
}
