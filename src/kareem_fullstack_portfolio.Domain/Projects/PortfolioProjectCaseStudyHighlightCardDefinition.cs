using Volo.Abp;

namespace kareem_fullstack_portfolio.Projects;

public class PortfolioProjectCaseStudyHighlightCardDefinition
{
    public const int MaxTitleLength = 80;
    public const int MaxSummaryLength = 220;

    public PortfolioProjectCaseStudyHighlightType Type { get; }

    public string Title { get; }

    public string Summary { get; }

    public int DisplayOrder { get; }

    public PortfolioProjectCaseStudyHighlightCardDefinition(
        PortfolioProjectCaseStudyHighlightType type,
        string title,
        string summary,
        int displayOrder)
    {
        Type = type;
        Title = title?.Trim() ?? string.Empty;
        Summary = summary?.Trim() ?? string.Empty;
        DisplayOrder = displayOrder;
    }

    public void EnsureValid()
    {
        if (string.IsNullOrWhiteSpace(Title))
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectCaseStudyHighlightCardInvalid)
                .WithData("HighlightType", Type.ToString())
                .WithData("FieldName", nameof(Title));
        }

        if (string.IsNullOrWhiteSpace(Summary))
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectCaseStudyHighlightCardInvalid)
                .WithData("HighlightType", Type.ToString())
                .WithData("FieldName", nameof(Summary));
        }

        if (DisplayOrder < 0)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectCaseStudyHighlightCardInvalid)
                .WithData("HighlightType", Type.ToString())
                .WithData("FieldName", nameof(DisplayOrder));
        }

        if (Title.Length > MaxTitleLength)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectCaseStudyTextTooLong)
                .WithData("SectionName", "HighlightCards")
                .WithData("FieldName", $"{Type}.{nameof(Title)}")
                .WithData("MaxLength", MaxTitleLength);
        }

        if (Summary.Length > MaxSummaryLength)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectCaseStudyTextTooLong)
                .WithData("SectionName", "HighlightCards")
                .WithData("FieldName", $"{Type}.{nameof(Summary)}")
                .WithData("MaxLength", MaxSummaryLength);
        }
    }
}
