using System.Collections.Generic;

namespace kareem_fullstack_portfolio.Experience;

public class PortfolioExperienceTimelineItemDefinition
{
    public PortfolioExperienceTimelineItemType Type { get; }

    public string StageLabel { get; }

    public string Title { get; }

    public string Organization { get; }

    public string Summary { get; }

    public string BusinessValue { get; }

    public IReadOnlyList<string> Highlights { get; }

    public bool IsPrimaryProfessionalExperience { get; }

    public int DisplayOrder { get; }

    public PortfolioExperienceTimelineItemDefinition(
        PortfolioExperienceTimelineItemType type,
        string stageLabel,
        string title,
        string organization,
        string summary,
        string businessValue,
        IReadOnlyList<string> highlights,
        bool isPrimaryProfessionalExperience,
        int displayOrder)
    {
        Type = type;
        StageLabel = stageLabel;
        Title = title;
        Organization = organization;
        Summary = summary;
        BusinessValue = businessValue;
        Highlights = highlights;
        IsPrimaryProfessionalExperience = isPrimaryProfessionalExperience;
        DisplayOrder = displayOrder;
    }
}
