using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Domain.Repositories;

namespace kareem_fullstack_portfolio.Experience;

[AllowAnonymous]
[Route("api/experience")]
public class PortfolioExperienceAppService : PortfolioExperienceAppServiceBase, IPortfolioExperienceAppService
{
    private readonly IPortfolioExperienceSectionDefinitionProvider _experienceSectionDefinitionProvider;

    public PortfolioExperienceAppService(
        IRepository<PortfolioExperience, Guid> portfolioExperienceRepository,
        IPortfolioExperienceSectionDefinitionProvider experienceSectionDefinitionProvider)
        : base(portfolioExperienceRepository)
    {
        _experienceSectionDefinitionProvider = experienceSectionDefinitionProvider;
    }

    [HttpGet]
    public async Task<PortfolioExperienceSectionDto> GetAsync()
    {
        var definition = _experienceSectionDefinitionProvider.Get();
        var experiences = await GetExperiencesWithDetailsAsync();

        return new PortfolioExperienceSectionDto
        {
            Headline = definition.Headline,
            Summary = definition.Summary,
            TimelineItems = experiences
                .Where(experience => experience.IsActive)
                .OrderBy(experience => experience.DisplayOrder)
                .ThenBy(experience => experience.Type)
                .Select(MapPublicTimelineItemDto)
                .ToList(),
            HighlightBadges = definition.HighlightBadges
                .OrderBy(item => item.DisplayOrder)
                .Select(CreateHighlightDto)
                .ToList()
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
