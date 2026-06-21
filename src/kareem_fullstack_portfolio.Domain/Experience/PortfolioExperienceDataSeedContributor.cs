using System;
using System.Threading.Tasks;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Uow;

namespace kareem_fullstack_portfolio.Experience;

public class PortfolioExperienceDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IRepository<PortfolioExperience, Guid> _portfolioExperienceRepository;
    private readonly IPortfolioExperienceSectionDefinitionProvider _experienceSectionDefinitionProvider;

    public PortfolioExperienceDataSeedContributor(
        IRepository<PortfolioExperience, Guid> portfolioExperienceRepository,
        IPortfolioExperienceSectionDefinitionProvider experienceSectionDefinitionProvider)
    {
        _portfolioExperienceRepository = portfolioExperienceRepository;
        _experienceSectionDefinitionProvider = experienceSectionDefinitionProvider;
    }

    [UnitOfWork]
    public async Task SeedAsync(DataSeedContext context)
    {
        if (await _portfolioExperienceRepository.GetCountAsync() > 0)
        {
            return;
        }

        var definition = _experienceSectionDefinitionProvider.Get();

        foreach (var item in definition.TimelineItems)
        {
            var experience = new PortfolioExperience(
                GetSeedId(item.Type),
                item.Type,
                item.StageLabel,
                item.Title,
                item.Organization,
                item.Summary,
                item.BusinessValue,
                item.Highlights,
                item.IsPrimaryProfessionalExperience,
                isActive: true,
                item.DisplayOrder);

            await _portfolioExperienceRepository.InsertAsync(experience, autoSave: true);
        }
    }

    private static Guid GetSeedId(PortfolioExperienceTimelineItemType type)
    {
        return type switch
        {
            PortfolioExperienceTimelineItemType.EngineeringFoundation => new Guid("8E3A5F10-7D6A-4B8E-9C31-2E7B4A930001"),
            PortfolioExperienceTimelineItemType.SearchAdsEvaluatorExperience => new Guid("8E3A5F10-7D6A-4B8E-9C31-2E7B4A930002"),
            PortfolioExperienceTimelineItemType.DotNetFullStackTraining => new Guid("8E3A5F10-7D6A-4B8E-9C31-2E7B4A930003"),
            PortfolioExperienceTimelineItemType.EnterpriseErpDelivery => new Guid("8E3A5F10-7D6A-4B8E-9C31-2E7B4A930004"),
            _ => throw new ArgumentOutOfRangeException(nameof(type), type, null)
        };
    }
}
