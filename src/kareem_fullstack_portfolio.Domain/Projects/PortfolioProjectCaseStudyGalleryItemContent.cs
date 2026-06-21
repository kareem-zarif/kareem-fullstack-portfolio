namespace kareem_fullstack_portfolio.Projects;

public class PortfolioProjectCaseStudyGalleryItemContent
{
    public PortfolioProjectCaseStudyGalleryItemType Type { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }

    public int DisplayOrder { get; set; }

    public PortfolioProjectCaseStudyGalleryItemDefinition ToDefinition()
    {
        return new PortfolioProjectCaseStudyGalleryItemDefinition(
            Type,
            Title,
            Summary,
            ImageUrl,
            DisplayOrder);
    }

    public static PortfolioProjectCaseStudyGalleryItemContent FromDefinition(PortfolioProjectCaseStudyGalleryItemDefinition definition)
    {
        return new PortfolioProjectCaseStudyGalleryItemContent
        {
            Type = definition.Type,
            Title = definition.Title,
            Summary = definition.Summary,
            ImageUrl = definition.ImageUrl,
            DisplayOrder = definition.DisplayOrder
        };
    }
}
