using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace kareem_fullstack_portfolio.Experience;

[AllowAnonymous]
public class PortfolioExperienceAppService : kareem_fullstack_portfolioAppService, IPortfolioExperienceAppService
{
    private readonly IPortfolioExperienceSectionDefinitionProvider _experienceSectionDefinitionProvider;

    public PortfolioExperienceAppService(IPortfolioExperienceSectionDefinitionProvider experienceSectionDefinitionProvider)
    {
        _experienceSectionDefinitionProvider = experienceSectionDefinitionProvider;
    }

    public Task<PortfolioExperienceSectionDto> GetAsync()
    {
        var definition = _experienceSectionDefinitionProvider.Get();

        return Task.FromResult(new PortfolioExperienceSectionDto
        {
            Headline = definition.Headline,
            Summary = definition.Summary,
            TimelineItems = definition.TimelineItems
                .OrderBy(item => item.DisplayOrder)
                .Select(CreateTimelineItemDto)
                .ToList(),
            HighlightBadges = definition.HighlightBadges
                .OrderBy(item => item.DisplayOrder)
                .Select(CreateHighlightDto)
                .ToList()
        });
    }

    private PortfolioExperienceTimelineItemDto CreateTimelineItemDto(PortfolioExperienceTimelineItemDefinition item)
    {
        return new PortfolioExperienceTimelineItemDto
        {
            Type = item.Type,
            TypeLabel = L[$"Enum:PortfolioExperienceTimelineItemType.{item.Type}"],
            StageLabel = item.StageLabel,
            Title = item.Title,
            Organization = item.Organization,
            Summary = item.Summary,
            BusinessValue = item.BusinessValue,
            Highlights = item.Highlights.ToList(),
            IsPrimaryProfessionalExperience = item.IsPrimaryProfessionalExperience,
            DisplayOrder = item.DisplayOrder
        };
    }

    private PortfolioExperienceHighlightDto CreateHighlightDto(PortfolioExperienceHighlightDefinition highlight)
    {
        return new PortfolioExperienceHighlightDto
        {
            Type = highlight.Type,
            Label = L[$"Enum:PortfolioExperienceHighlightType.{highlight.Type}"],
            DisplayOrder = highlight.DisplayOrder
        };
    }
}
