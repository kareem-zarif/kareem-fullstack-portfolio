namespace kareem_fullstack_portfolio.Projects;

public class PortfolioProjectCaseStudyGalleryItemDto
{
    public PortfolioProjectCaseStudyGalleryItemType Type { get; set; }

    public string TypeLabel { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }

    public bool HasImage => !string.IsNullOrWhiteSpace(ImageUrl);

    public int DisplayOrder { get; set; }
}
