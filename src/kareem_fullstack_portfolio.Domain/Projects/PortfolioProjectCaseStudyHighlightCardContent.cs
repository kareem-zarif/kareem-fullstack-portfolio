namespace kareem_fullstack_portfolio.Projects;

public class PortfolioProjectCaseStudyHighlightCardContent
{
    public PortfolioProjectCaseStudyHighlightType Type { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;

    public int DisplayOrder { get; set; }

    public PortfolioProjectCaseStudyHighlightCardDefinition ToDefinition()
    {
        return new PortfolioProjectCaseStudyHighlightCardDefinition(
            Type,
            Title,
            Summary,
            DisplayOrder);
    }

    public static PortfolioProjectCaseStudyHighlightCardContent FromDefinition(PortfolioProjectCaseStudyHighlightCardDefinition definition)
    {
        return new PortfolioProjectCaseStudyHighlightCardContent
        {
            Type = definition.Type,
            Title = definition.Title,
            Summary = definition.Summary,
            DisplayOrder = definition.DisplayOrder
        };
    }
}
