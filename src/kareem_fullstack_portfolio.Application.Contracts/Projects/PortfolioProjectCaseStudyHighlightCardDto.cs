namespace kareem_fullstack_portfolio.Projects;

public class PortfolioProjectCaseStudyHighlightCardDto
{
    public PortfolioProjectCaseStudyHighlightType Type { get; set; }

    public string Label { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;

    public int DisplayOrder { get; set; }
}
