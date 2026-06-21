using Volo.Abp;

namespace kareem_fullstack_portfolio.Projects;

public class PortfolioProjectCaseStudyGalleryItemDefinition
{
    internal const int MaxTitleLength = 120;
    internal const int MaxSummaryLength = 320;
    internal const int MaxImageUrlLength = PortfolioProjectConsts.MaxUrlLength;

    public PortfolioProjectCaseStudyGalleryItemType Type { get; }

    public string Title { get; }

    public string Summary { get; }

    public string? ImageUrl { get; }

    public int DisplayOrder { get; }

    public PortfolioProjectCaseStudyGalleryItemDefinition(
        PortfolioProjectCaseStudyGalleryItemType type,
        string title,
        string summary,
        string? imageUrl,
        int displayOrder)
    {
        Type = type;
        Title = title?.Trim() ?? string.Empty;
        Summary = summary?.Trim() ?? string.Empty;
        ImageUrl = string.IsNullOrWhiteSpace(imageUrl) ? null : imageUrl.Trim();
        DisplayOrder = displayOrder;
    }

    public static PortfolioProjectCaseStudyGalleryItemDefinition Placeholder(
        string title,
        string summary,
        int displayOrder)
    {
        return new PortfolioProjectCaseStudyGalleryItemDefinition(
            PortfolioProjectCaseStudyGalleryItemType.Placeholder,
            title,
            summary,
            null,
            displayOrder);
    }

    public void EnsureValid()
    {
        if (DisplayOrder < 0)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectDisplayOrderMustBeZeroOrPositive);
        }

        EnsureText(Title, "Gallery", nameof(Title), MaxTitleLength);
        EnsureText(Summary, "Gallery", nameof(Summary), MaxSummaryLength);

        if (Type == PortfolioProjectCaseStudyGalleryItemType.Screenshot && string.IsNullOrWhiteSpace(ImageUrl))
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectCaseStudyGalleryItemInvalid)
                .WithData("GalleryItemType", Type.ToString())
                .WithData("Title", Title);
        }

        if (Type == PortfolioProjectCaseStudyGalleryItemType.Placeholder && !string.IsNullOrWhiteSpace(ImageUrl))
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectCaseStudyGalleryItemInvalid)
                .WithData("GalleryItemType", Type.ToString())
                .WithData("Title", Title);
        }

        if (!string.IsNullOrWhiteSpace(ImageUrl) && ImageUrl.Length > MaxImageUrlLength)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectCaseStudyTextTooLong)
                .WithData("SectionName", "Gallery")
                .WithData("FieldName", nameof(ImageUrl))
                .WithData("MaxLength", MaxImageUrlLength);
        }
    }

    private static void EnsureText(string value, string sectionName, string fieldName, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectCaseStudyListItemRequired)
                .WithData("SectionName", sectionName);
        }

        if (value.Length > maxLength)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectCaseStudyTextTooLong)
                .WithData("SectionName", sectionName)
                .WithData("FieldName", fieldName)
                .WithData("MaxLength", maxLength);
        }
    }
}
