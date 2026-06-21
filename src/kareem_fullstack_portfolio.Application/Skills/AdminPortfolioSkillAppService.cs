using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using kareem_fullstack_portfolio.Permissions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Domain.Repositories;

namespace kareem_fullstack_portfolio.Skills;

[Authorize(kareem_fullstack_portfolioPermissions.Admin.Access)]
[Route("api/admin/skills")]
public class AdminPortfolioSkillAppService : PortfolioSkillAppServiceBase, IAdminPortfolioSkillAppService
{
    public AdminPortfolioSkillAppService(IRepository<PortfolioSkill, Guid> portfolioSkillRepository)
        : base(portfolioSkillRepository)
    {
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Skills.Default)]
    [HttpGet]
    public async Task<IReadOnlyList<PortfolioSkillAdminDto>> GetListAsync()
    {
        var queryable = await PortfolioSkillRepository.GetQueryableAsync();
        var skills = await AsyncExecuter.ToListAsync(
            queryable
                .OrderBy(skill => skill.Category)
                .ThenBy(skill => skill.DisplayOrder)
                .ThenBy(skill => skill.Name));

        return skills
            .Select(MapAdminDto)
            .ToList();
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Skills.Default)]
    [HttpGet("{id:guid}")]
    public async Task<PortfolioSkillAdminDto> GetAsync(Guid id)
    {
        var skill = await GetSkillAsync(id);

        return MapAdminDto(skill);
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Skills.Manage)]
    [HttpPost]
    public async Task<PortfolioSkillAdminDto> CreateAsync(CreateUpdatePortfolioSkillDto input)
    {
        await EnsureUniqueNameAsync(input.Name, input.Category);

        var skill = new PortfolioSkill(
            GuidGenerator.Create(),
            input.Name,
            input.Category,
            input.IsPrimary,
            input.IsActive,
            input.DisplayOrder);

        await PortfolioSkillRepository.InsertAsync(skill, autoSave: true);

        return MapAdminDto(skill);
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Skills.Manage)]
    [HttpPut("{id:guid}")]
    public async Task<PortfolioSkillAdminDto> UpdateAsync(Guid id, CreateUpdatePortfolioSkillDto input)
    {
        var skill = await GetSkillAsync(id);

        await EnsureUniqueNameAsync(input.Name, input.Category, id);

        skill.Update(
            input.Name,
            input.Category,
            input.IsPrimary,
            input.IsActive,
            input.DisplayOrder);

        await PortfolioSkillRepository.UpdateAsync(skill, autoSave: true);

        return MapAdminDto(skill);
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Skills.Manage)]
    [HttpDelete("{id:guid}")]
    public async Task DeleteAsync(Guid id)
    {
        await GetSkillAsync(id);
        await PortfolioSkillRepository.DeleteAsync(id, autoSave: true);
    }
}
