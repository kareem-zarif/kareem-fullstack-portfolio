using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;

namespace kareem_fullstack_portfolio.Experience;

public abstract class PortfolioExperienceAppServiceBase : kareem_fullstack_portfolioAppService
{
    protected readonly IRepository<PortfolioExperience, Guid> PortfolioExperienceRepository;

    protected PortfolioExperienceAppServiceBase(IRepository<PortfolioExperience, Guid> portfolioExperienceRepository)
    {
        PortfolioExperienceRepository = portfolioExperienceRepository;
    }

    protected PortfolioExperienceTimelineItemDto MapPublicTimelineItemDto(PortfolioExperience experience)
    {
        return new PortfolioExperienceTimelineItemDto
        {
            Type = experience.Type,
            TypeLabel = L[$"Enum:PortfolioExperienceTimelineItemType.{experience.Type}"],
            StageLabel = experience.StageLabel,
            Title = experience.Title,
            Organization = experience.Organization,
            Summary = experience.Summary,
            BusinessValue = experience.BusinessValue,
            Highlights = experience.Highlights
                .OrderBy(highlight => highlight.DisplayOrder)
                .Select(highlight => highlight.Text)
                .ToList(),
            IsPrimaryProfessionalExperience = experience.IsPrimaryProfessionalExperience,
            DisplayOrder = experience.DisplayOrder
        };
    }

    protected PortfolioExperienceAdminDto MapAdminDto(PortfolioExperience experience)
    {
        return new PortfolioExperienceAdminDto
        {
            Id = experience.Id,
            Type = experience.Type,
            TypeLabel = L[$"Enum:PortfolioExperienceTimelineItemType.{experience.Type}"],
            StageLabel = experience.StageLabel,
            Title = experience.Title,
            Organization = experience.Organization,
            Summary = experience.Summary,
            BusinessValue = experience.BusinessValue,
            Highlights = experience.Highlights
                .OrderBy(highlight => highlight.DisplayOrder)
                .Select(highlight => highlight.Text)
                .ToList(),
            IsPrimaryProfessionalExperience = experience.IsPrimaryProfessionalExperience,
            IsActive = experience.IsActive,
            DisplayOrder = experience.DisplayOrder
        };
    }

    protected async Task<List<PortfolioExperience>> GetExperiencesWithDetailsAsync()
    {
        var queryable = await PortfolioExperienceRepository.WithDetailsAsync(experience => experience.Highlights);

        return await AsyncExecuter.ToListAsync(queryable);
    }

    protected async Task<PortfolioExperience> GetExperienceAsync(Guid id)
    {
        var queryable = await PortfolioExperienceRepository.WithDetailsAsync(experience => experience.Highlights);
        var experience = await AsyncExecuter.FirstOrDefaultAsync(queryable.Where(item => item.Id == id));

        if (experience is not null)
        {
            return experience;
        }

        throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceNotFound)
            .WithData("ExperienceId", id);
    }

    protected async Task EnsureUniqueTypeAsync(PortfolioExperienceTimelineItemType type, Guid? excludedExperienceId = null)
    {
        var queryable = await PortfolioExperienceRepository.GetQueryableAsync();
        var duplicateExists = await AsyncExecuter.AnyAsync(
            queryable.Where(experience =>
                experience.Type == type &&
                (!excludedExperienceId.HasValue || experience.Id != excludedExperienceId.Value)));

        if (!duplicateExists)
        {
            return;
        }

        throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceDuplicateType)
            .WithData("ExperienceType", L[$"Enum:PortfolioExperienceTimelineItemType.{type}"].Value);
    }

    protected async Task EnsurePrimaryExperienceRulesAsync(
        CreateUpdatePortfolioExperienceDto input,
        Guid? excludedExperienceId = null)
    {
        if (input.IsPrimaryProfessionalExperience &&
            input.Type != PortfolioExperienceTimelineItemType.EnterpriseErpDelivery)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperiencePrimaryProfessionalExperienceMustBeErp)
                .WithData("ExperienceType", L[$"Enum:PortfolioExperienceTimelineItemType.{input.Type}"].Value);
        }

        if (!input.IsPrimaryProfessionalExperience)
        {
            return;
        }

        var queryable = await PortfolioExperienceRepository.GetQueryableAsync();
        var duplicatePrimaryExists = await AsyncExecuter.AnyAsync(
            queryable.Where(experience =>
                experience.IsPrimaryProfessionalExperience &&
                (!excludedExperienceId.HasValue || experience.Id != excludedExperienceId.Value)));

        if (!duplicatePrimaryExists)
        {
            return;
        }

        throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperiencePrimaryProfessionalExperienceAlreadyExists);
    }
}
