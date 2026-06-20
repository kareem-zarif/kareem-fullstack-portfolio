namespace kareem_fullstack_portfolio.Experience;

public class PortfolioExperienceHighlightDto
{
    public PortfolioExperienceHighlightType Type { get; set; }

    public string Label { get; set; } = string.Empty;

    public int DisplayOrder { get; set; }
}
