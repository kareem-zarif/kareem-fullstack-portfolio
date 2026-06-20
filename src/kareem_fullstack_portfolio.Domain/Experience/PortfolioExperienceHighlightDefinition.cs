namespace kareem_fullstack_portfolio.Experience;

public class PortfolioExperienceHighlightDefinition
{
    public PortfolioExperienceHighlightType Type { get; }

    public int DisplayOrder { get; }

    public PortfolioExperienceHighlightDefinition(PortfolioExperienceHighlightType type, int displayOrder)
    {
        Type = type;
        DisplayOrder = displayOrder;
    }
}
