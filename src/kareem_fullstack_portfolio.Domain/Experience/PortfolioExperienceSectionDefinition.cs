using System;
using System.Collections.Generic;
using System.Linq;
using Volo.Abp;

namespace kareem_fullstack_portfolio.Experience;

public class PortfolioExperienceSectionDefinition
{
    private const int SummaryMaxLength = 240;
    private const int TimelineTextMaxLength = 220;
    private const int TimelineHighlightMaxLength = 80;

    public string Headline { get; }

    public string Summary { get; }

    public IReadOnlyList<PortfolioExperienceTimelineItemDefinition> TimelineItems { get; }

    public IReadOnlyList<PortfolioExperienceHighlightDefinition> HighlightBadges { get; }

    public PortfolioExperienceSectionDefinition(
        string headline,
        string summary,
        IReadOnlyList<PortfolioExperienceTimelineItemDefinition> timelineItems,
        IReadOnlyList<PortfolioExperienceHighlightDefinition> highlightBadges)
    {
        Headline = headline;
        Summary = summary;
        TimelineItems = timelineItems;
        HighlightBadges = highlightBadges;
    }

    public void EnsureValid()
    {
        if (Headline.IsNullOrWhiteSpace())
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceHeadlineRequired);
        }

        if (Summary.IsNullOrWhiteSpace())
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceSummaryRequired);
        }

        if (Summary.Length > SummaryMaxLength)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceSummaryTooLong)
                .WithData("MaxLength", SummaryMaxLength);
        }

        EnsureTimelineCoverage();
        EnsurePrimaryExperience();
        EnsureRequiredHighlights();
        EnsureTimelineItemsStayConcise();
    }

    private void EnsureTimelineCoverage()
    {
        foreach (var itemType in Enum.GetValues<PortfolioExperienceTimelineItemType>())
        {
            if (TimelineItems.All(item => item.Type != itemType))
            {
                throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceMissingTimelineItem)
                    .WithData("TimelineItemType", itemType.ToString());
            }
        }
    }

    private void EnsurePrimaryExperience()
    {
        var primaryItems = TimelineItems.Where(item => item.IsPrimaryProfessionalExperience).ToList();

        if (primaryItems.Count != 1 || primaryItems[0].Type != PortfolioExperienceTimelineItemType.EnterpriseErpDelivery)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperiencePrimaryItemMustBeErp);
        }
    }

    private void EnsureRequiredHighlights()
    {
        foreach (var highlightType in new[]
                 {
                     PortfolioExperienceHighlightType.AnalyticalThinking,
                     PortfolioExperienceHighlightType.BusinessUnderstanding
                 })
        {
            if (HighlightBadges.All(highlight => highlight.Type != highlightType))
            {
                throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceMissingHighlight)
                    .WithData("HighlightType", highlightType.ToString());
            }
        }
    }

    private void EnsureTimelineItemsStayConcise()
    {
        foreach (var item in TimelineItems)
        {
            EnsureRequiredText(item, item.StageLabel, nameof(item.StageLabel));
            EnsureRequiredText(item, item.Title, nameof(item.Title));
            EnsureRequiredText(item, item.Organization, nameof(item.Organization));
            EnsureRequiredText(item, item.Summary, nameof(item.Summary));
            EnsureRequiredText(item, item.BusinessValue, nameof(item.BusinessValue));

            EnsureMaxLength(item, item.Summary, nameof(item.Summary), TimelineTextMaxLength);
            EnsureMaxLength(item, item.BusinessValue, nameof(item.BusinessValue), TimelineTextMaxLength);

            foreach (var highlight in item.Highlights)
            {
                EnsureMaxLength(item, highlight, nameof(item.Highlights), TimelineHighlightMaxLength);
            }
        }
    }

    private static void EnsureRequiredText(
        PortfolioExperienceTimelineItemDefinition item,
        string value,
        string fieldName)
    {
        if (value.IsNullOrWhiteSpace())
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceTimelineItemFieldRequired)
                .WithData("TimelineItemType", item.Type.ToString())
                .WithData("FieldName", fieldName);
        }
    }

    private static void EnsureMaxLength(
        PortfolioExperienceTimelineItemDefinition item,
        string value,
        string fieldName,
        int maxLength)
    {
        if (value.Length > maxLength)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceTimelineItemTextTooLong)
                .WithData("TimelineItemType", item.Type.ToString())
                .WithData("FieldName", fieldName)
                .WithData("MaxLength", maxLength);
        }
    }
}
