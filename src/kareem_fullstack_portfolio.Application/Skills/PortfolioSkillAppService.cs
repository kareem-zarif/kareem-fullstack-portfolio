using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using kareem_fullstack_portfolio.Permissions;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;

namespace kareem_fullstack_portfolio.Skills;

[Authorize(kareem_fullstack_portfolioPermissions.Admin.Access)]
public class PortfolioSkillAppService : kareem_fullstack_portfolioAppService, IPortfolioSkillAppService
{
    private readonly IRepository<PortfolioSkill, Guid> _portfolioSkillRepository;

    public PortfolioSkillAppService(IRepository<PortfolioSkill, Guid> portfolioSkillRepository)
    {
        _portfolioSkillRepository = portfolioSkillRepository;
    }

    [AllowAnonymous]
    public async Task<IReadOnlyList<PortfolioSkillCategoryDto>> GetPublicListAsync()
    {
        var queryable = await _portfolioSkillRepository.GetQueryableAsync();
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

    [Authorize(kareem_fullstack_portfolioPermissions.Skills.Default)]
    public async Task<IReadOnlyList<PortfolioSkillAdminDto>> GetAdminListAsync()
    {
        var queryable = await _portfolioSkillRepository.GetQueryableAsync();
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
    public async Task<PortfolioSkillAdminDto> GetAsync(Guid id)
    {
        var skill = await GetSkillAsync(id);

        return MapAdminDto(skill);
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Skills.Manage)]
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

        await _portfolioSkillRepository.InsertAsync(skill, autoSave: true);

        return MapAdminDto(skill);
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Skills.Manage)]
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

        await _portfolioSkillRepository.UpdateAsync(skill, autoSave: true);

        return MapAdminDto(skill);
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Skills.Manage)]
    public async Task DeleteAsync(Guid id)
    {
        await GetSkillAsync(id);
        await _portfolioSkillRepository.DeleteAsync(id, autoSave: true);
    }

    private PortfolioSkillDto MapPublicDto(PortfolioSkill skill)
    {
        return new PortfolioSkillDto
        {
            Id = skill.Id,
            Name = skill.Name,
            IsPrimary = skill.IsPrimary,
            DisplayOrder = skill.DisplayOrder
        };
    }

    private PortfolioSkillAdminDto MapAdminDto(PortfolioSkill skill)
    {
        return new PortfolioSkillAdminDto
        {
            Id = skill.Id,
            Name = skill.Name,
            Category = skill.Category,
            CategoryLabel = L[$"Enum:PortfolioSkillCategory.{skill.Category}"],
            IsPrimary = skill.IsPrimary,
            IsActive = skill.IsActive,
            DisplayOrder = skill.DisplayOrder
        };
    }

    private async Task<PortfolioSkill> GetSkillAsync(Guid id)
    {
        var skill = await _portfolioSkillRepository.FindAsync(id);

        if (skill is not null)
        {
            return skill;
        }

        throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioSkillNotFound)
            .WithData("SkillId", id);
    }

    private async Task EnsureUniqueNameAsync(string name, PortfolioSkillCategory category, Guid? excludedSkillId = null)
    {
        var normalizedName = NormalizeName(name).ToUpperInvariant();
        var queryable = await _portfolioSkillRepository.GetQueryableAsync();

        var duplicateExists = await AsyncExecuter.AnyAsync(
            queryable.Where(skill =>
                skill.Category == category &&
                skill.Name.ToUpper() == normalizedName &&
                (!excludedSkillId.HasValue || skill.Id != excludedSkillId.Value)));

        if (!duplicateExists)
        {
            return;
        }

        throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioSkillDuplicateNameInCategory)
            .WithData("Name", NormalizeName(name))
            .WithData("Category", L[$"Enum:PortfolioSkillCategory.{category}"].Value);
    }

    private static string NormalizeName(string? name)
    {
        if (name.IsNullOrWhiteSpace())
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioSkillNameRequired);
        }

        var normalizedName = name.Trim();

        if (normalizedName.Length > PortfolioSkillConsts.MaxNameLength)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioSkillNameTooLong)
                .WithData("MaxLength", PortfolioSkillConsts.MaxNameLength);
        }

        return normalizedName;
    }
}
