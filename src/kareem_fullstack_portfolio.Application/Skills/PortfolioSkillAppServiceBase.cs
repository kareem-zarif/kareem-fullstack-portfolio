using System;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;

namespace kareem_fullstack_portfolio.Skills;

public abstract class PortfolioSkillAppServiceBase : kareem_fullstack_portfolioAppService
{
    protected readonly IRepository<PortfolioSkill, Guid> PortfolioSkillRepository;

    protected PortfolioSkillAppServiceBase(IRepository<PortfolioSkill, Guid> portfolioSkillRepository)
    {
        PortfolioSkillRepository = portfolioSkillRepository;
    }

    protected PortfolioSkillDto MapPublicDto(PortfolioSkill skill)
    {
        return new PortfolioSkillDto
        {
            Id = skill.Id,
            Name = skill.Name,
            IsPrimary = skill.IsPrimary,
            DisplayOrder = skill.DisplayOrder
        };
    }

    protected PortfolioSkillAdminDto MapAdminDto(PortfolioSkill skill)
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

    protected async Task<PortfolioSkill> GetSkillAsync(Guid id)
    {
        var skill = await PortfolioSkillRepository.FindAsync(id);

        if (skill is not null)
        {
            return skill;
        }

        throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioSkillNotFound)
            .WithData("SkillId", id);
    }

    protected async Task EnsureUniqueNameAsync(string name, PortfolioSkillCategory category, Guid? excludedSkillId = null)
    {
        var normalizedName = NormalizeName(name).ToUpperInvariant();
        var queryable = await PortfolioSkillRepository.GetQueryableAsync();

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

    protected static string NormalizeName(string? name)
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
