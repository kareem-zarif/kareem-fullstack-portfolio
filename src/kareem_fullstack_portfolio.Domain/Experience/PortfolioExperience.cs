using System;
using System.Collections.Generic;
using System.Linq;
using Volo.Abp;
using Volo.Abp.Domain.Entities.Auditing;

namespace kareem_fullstack_portfolio.Experience;

public class PortfolioExperience : FullAuditedAggregateRoot<Guid>
{
    public PortfolioExperienceTimelineItemType Type { get; private set; }

    public string StageLabel { get; private set; } = string.Empty;

    public string Title { get; private set; } = string.Empty;

    public string Organization { get; private set; } = string.Empty;

    public string Summary { get; private set; } = string.Empty;

    public string BusinessValue { get; private set; } = string.Empty;

    public bool IsPrimaryProfessionalExperience { get; private set; }

    public bool IsActive { get; private set; }

    public int DisplayOrder { get; private set; }

    public ICollection<PortfolioExperienceHighlight> Highlights { get; private set; } = new List<PortfolioExperienceHighlight>();

    protected PortfolioExperience()
    {
    }

    public PortfolioExperience(
        Guid id,
        PortfolioExperienceTimelineItemType type,
        string stageLabel,
        string title,
        string organization,
        string summary,
        string businessValue,
        IReadOnlyCollection<string> highlights,
        bool isPrimaryProfessionalExperience,
        bool isActive,
        int displayOrder)
        : base(id)
    {
        SetType(type);
        SetStageLabel(stageLabel);
        SetTitle(title);
        SetOrganization(organization);
        SetSummary(summary);
        SetBusinessValue(businessValue);
        SetDisplayOrder(displayOrder);
        SetHighlights(highlights);

        IsPrimaryProfessionalExperience = isPrimaryProfessionalExperience;
        IsActive = isActive;
    }

    public void Update(
        PortfolioExperienceTimelineItemType type,
        string stageLabel,
        string title,
        string organization,
        string summary,
        string businessValue,
        IReadOnlyCollection<string> highlights,
        bool isPrimaryProfessionalExperience,
        bool isActive,
        int displayOrder)
    {
        SetType(type);
        SetStageLabel(stageLabel);
        SetTitle(title);
        SetOrganization(organization);
        SetSummary(summary);
        SetBusinessValue(businessValue);
        SetDisplayOrder(displayOrder);
        SetHighlights(highlights);

        IsPrimaryProfessionalExperience = isPrimaryProfessionalExperience;
        IsActive = isActive;
    }

    private void SetType(PortfolioExperienceTimelineItemType type)
    {
        Type = type;
    }

    private void SetStageLabel(string stageLabel)
    {
        StageLabel = NormalizeRequiredText(
            stageLabel,
            kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceStageLabelRequired,
            kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceStageLabelTooLong,
            PortfolioExperienceConsts.MaxStageLabelLength);
    }

    private void SetTitle(string title)
    {
        Title = NormalizeRequiredText(
            title,
            kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceTitleRequired,
            kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceTitleTooLong,
            PortfolioExperienceConsts.MaxTitleLength);
    }

    private void SetOrganization(string organization)
    {
        Organization = NormalizeRequiredText(
            organization,
            kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceOrganizationRequired,
            kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceOrganizationTooLong,
            PortfolioExperienceConsts.MaxOrganizationLength);
    }

    private void SetSummary(string summary)
    {
        Summary = NormalizeRequiredText(
            summary,
            kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceSummaryRequired,
            kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceSummaryTooLong,
            PortfolioExperienceConsts.MaxSummaryLength);
    }

    private void SetBusinessValue(string businessValue)
    {
        BusinessValue = NormalizeRequiredText(
            businessValue,
            kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceBusinessValueRequired,
            kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceBusinessValueTooLong,
            PortfolioExperienceConsts.MaxBusinessValueLength);
    }

    private void SetDisplayOrder(int displayOrder)
    {
        if (displayOrder < 0)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceDisplayOrderMustBeZeroOrPositive);
        }

        DisplayOrder = displayOrder;
    }

    private void SetHighlights(IReadOnlyCollection<string> highlights)
    {
        if (highlights is null || highlights.Count == 0)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceHighlightRequired);
        }

        var normalizedHighlights = highlights
            .Select(highlight =>
            {
                if (highlight.IsNullOrWhiteSpace())
                {
                    throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceHighlightRequired);
                }

                var normalizedHighlight = highlight.Trim();

                if (normalizedHighlight.Length > PortfolioExperienceConsts.MaxHighlightLength)
                {
                    throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceHighlightTooLong)
                        .WithData("MaxLength", PortfolioExperienceConsts.MaxHighlightLength);
                }

                return normalizedHighlight;
            })
            .ToList();

        var duplicateHighlight = normalizedHighlights
            .GroupBy(highlight => highlight, StringComparer.OrdinalIgnoreCase)
            .FirstOrDefault(group => group.Count() > 1);

        if (duplicateHighlight is not null)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceDuplicateHighlight)
                .WithData("Highlight", duplicateHighlight.Key);
        }

        Highlights.Clear();

        for (var index = 0; index < normalizedHighlights.Count; index++)
        {
            Highlights.Add(new PortfolioExperienceHighlight(
                Guid.NewGuid(),
                Id,
                normalizedHighlights[index],
                index));
        }
    }

    private static string NormalizeRequiredText(
        string value,
        string requiredErrorCode,
        string tooLongErrorCode,
        int maxLength)
    {
        if (value.IsNullOrWhiteSpace())
        {
            throw new BusinessException(requiredErrorCode);
        }

        var normalizedValue = value.Trim();

        if (normalizedValue.Length > maxLength)
        {
            throw new BusinessException(tooLongErrorCode)
                .WithData("MaxLength", maxLength);
        }

        return normalizedValue;
    }
}
