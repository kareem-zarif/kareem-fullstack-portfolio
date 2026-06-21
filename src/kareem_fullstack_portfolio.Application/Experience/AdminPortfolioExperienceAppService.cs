using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using kareem_fullstack_portfolio.Permissions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Domain.Repositories;

namespace kareem_fullstack_portfolio.Experience;

[Authorize(kareem_fullstack_portfolioPermissions.Admin.Access)]
[Route("api/admin/experience")]
public class AdminPortfolioExperienceAppService : PortfolioExperienceAppServiceBase, IAdminPortfolioExperienceAppService
{
    public AdminPortfolioExperienceAppService(IRepository<PortfolioExperience, Guid> portfolioExperienceRepository)
        : base(portfolioExperienceRepository)
    {
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Experience.Default)]
    [HttpGet]
    public async Task<IReadOnlyList<PortfolioExperienceAdminDto>> GetListAsync()
    {
        var experiences = await GetExperiencesWithDetailsAsync();

        return experiences
            .OrderBy(experience => experience.DisplayOrder)
            .ThenBy(experience => experience.Type)
            .Select(MapAdminDto)
            .ToList();
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Experience.Default)]
    [HttpGet("{id:guid}")]
    public async Task<PortfolioExperienceAdminDto> GetAsync(Guid id)
    {
        var experience = await GetExperienceAsync(id);
        return MapAdminDto(experience);
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Experience.Manage)]
    [HttpPost]
    public async Task<PortfolioExperienceAdminDto> CreateAsync(CreateUpdatePortfolioExperienceDto input)
    {
        await EnsureUniqueTypeAsync(input.Type);
        await EnsurePrimaryExperienceRulesAsync(input);

        var experience = new PortfolioExperience(
            GuidGenerator.Create(),
            input.Type,
            input.StageLabel,
            input.Title,
            input.Organization,
            input.Summary,
            input.BusinessValue,
            input.Highlights,
            input.IsPrimaryProfessionalExperience,
            input.IsActive,
            input.DisplayOrder);

        await PortfolioExperienceRepository.InsertAsync(experience, autoSave: true);

        return MapAdminDto(experience);
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Experience.Manage)]
    [HttpPut("{id:guid}")]
    public async Task<PortfolioExperienceAdminDto> UpdateAsync(Guid id, CreateUpdatePortfolioExperienceDto input)
    {
        var experience = await GetExperienceAsync(id);

        await EnsureUniqueTypeAsync(input.Type, id);
        await EnsurePrimaryExperienceRulesAsync(input, id);

        experience.Update(
            input.Type,
            input.StageLabel,
            input.Title,
            input.Organization,
            input.Summary,
            input.BusinessValue,
            input.Highlights,
            input.IsPrimaryProfessionalExperience,
            input.IsActive,
            input.DisplayOrder);

        await PortfolioExperienceRepository.UpdateAsync(experience, autoSave: true);

        return MapAdminDto(experience);
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Experience.Manage)]
    [HttpDelete("{id:guid}")]
    public async Task DeleteAsync(Guid id)
    {
        await GetExperienceAsync(id);
        await PortfolioExperienceRepository.DeleteAsync(id, autoSave: true);
    }
}
