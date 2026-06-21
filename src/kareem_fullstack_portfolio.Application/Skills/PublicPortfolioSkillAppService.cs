using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Domain.Repositories;

namespace kareem_fullstack_portfolio.Skills;

[AllowAnonymous]
[Route("api/skills")]
public class PublicPortfolioSkillAppService : PortfolioSkillAppServiceBase, IPublicPortfolioSkillAppService
{
    public PublicPortfolioSkillAppService(IRepository<PortfolioSkill, Guid> portfolioSkillRepository)
        : base(portfolioSkillRepository)
    {
    }

    [HttpGet]
    public async Task<IReadOnlyList<PortfolioSkillCategoryDto>> GetListAsync()
    {
        var queryable = await PortfolioSkillRepository.GetQueryableAsync();
        var skills = await AsyncExecuter.ToListAsync(
            queryable
                .Where(skill => skill.IsActive)
                .OrderBy(skill => skill.Category)
                .ThenBy(skill => skill.DisplayOrder)
                .ThenBy(skill => skill.Name));

        var groupedSkills = skills
            .GroupBy(skill => skill.Category)
            .ToDictionary(group => group.Key, group => group.ToList());

        return Enum.GetValues<PortfolioSkillCategory>()
            .Where(groupedSkills.ContainsKey)
            .Select(category => new PortfolioSkillCategoryDto
            {
                Category = category,
                CategoryLabel = L[$"Enum:PortfolioSkillCategory.{category}"],
                Skills = groupedSkills[category]
                    .Select(MapPublicDto)
                    .ToList()
            })
            .ToList();
    }
}
