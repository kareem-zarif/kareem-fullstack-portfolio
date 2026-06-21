namespace kareem_fullstack_portfolio.Projects;

public class PortfolioProjectCaseStudySectionDto
{
    public PortfolioProjectCaseStudySectionType Type { get; set; }

    public string Label { get; set; } = string.Empty;

    public bool IsVisible { get; set; }

    public int DisplayOrder { get; set; }
}
