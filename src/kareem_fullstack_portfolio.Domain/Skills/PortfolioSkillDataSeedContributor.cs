using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Uow;

namespace kareem_fullstack_portfolio.Skills;

public class PortfolioSkillDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IRepository<PortfolioSkill, Guid> _portfolioSkillRepository;

    public PortfolioSkillDataSeedContributor(IRepository<PortfolioSkill, Guid> portfolioSkillRepository)
    {
        _portfolioSkillRepository = portfolioSkillRepository;
    }

    [UnitOfWork]
    public async Task SeedAsync(DataSeedContext context)
    {
        if (await _portfolioSkillRepository.GetCountAsync() > 0)
        {
            return;
        }

        foreach (var seed in GetSeeds())
        {
            var skill = new PortfolioSkill(
                seed.Id,
                seed.Name,
                seed.Category,
                seed.IsPrimary,
                isActive: true,
                seed.DisplayOrder);

            await _portfolioSkillRepository.InsertAsync(skill, autoSave: true);
        }
    }

    private static IReadOnlyList<PortfolioSkillSeedItem> GetSeeds()
    {
        return
        [
            new(new Guid("1B7E5C7A-2B69-4E8A-A5D5-6E9E819A1001"), "ASP.NET Core", PortfolioSkillCategory.BackendApis, true, 1),
            new(new Guid("1B7E5C7A-2B69-4E8A-A5D5-6E9E819A1002"), "REST APIs", PortfolioSkillCategory.BackendApis, true, 2),
            new(new Guid("1B7E5C7A-2B69-4E8A-A5D5-6E9E819A1003"), "JWT Authentication", PortfolioSkillCategory.BackendApis, true, 3),
            new(new Guid("1B7E5C7A-2B69-4E8A-A5D5-6E9E819A1004"), "Angular", PortfolioSkillCategory.Frontend, true, 1),
            new(new Guid("1B7E5C7A-2B69-4E8A-A5D5-6E9E819A1005"), "TypeScript", PortfolioSkillCategory.Frontend, true, 2),
            new(new Guid("1B7E5C7A-2B69-4E8A-A5D5-6E9E819A1006"), "SQL Server", PortfolioSkillCategory.Database, true, 1),
            new(new Guid("1B7E5C7A-2B69-4E8A-A5D5-6E9E819A1007"), "Entity Framework Core", PortfolioSkillCategory.Database, true, 2),
            new(new Guid("1B7E5C7A-2B69-4E8A-A5D5-6E9E819A1008"), "Clean Architecture", PortfolioSkillCategory.Architecture, true, 1),
            new(new Guid("1B7E5C7A-2B69-4E8A-A5D5-6E9E819A1009"), "Repository Pattern", PortfolioSkillCategory.Architecture, true, 2),
            new(new Guid("1B7E5C7A-2B69-4E8A-A5D5-6E9E819A1010"), "ABP Framework", PortfolioSkillCategory.Architecture, true, 3),
            new(new Guid("1B7E5C7A-2B69-4E8A-A5D5-6E9E819A1011"), "Swagger / OpenAPI", PortfolioSkillCategory.Tools, false, 1),
            new(new Guid("1B7E5C7A-2B69-4E8A-A5D5-6E9E819A1012"), "Git & GitHub", PortfolioSkillCategory.Tools, false, 2),
            new(new Guid("1B7E5C7A-2B69-4E8A-A5D5-6E9E819A1013"), "Analytical Thinking", PortfolioSkillCategory.BusinessAndSoftSkills, false, 1),
            new(new Guid("1B7E5C7A-2B69-4E8A-A5D5-6E9E819A1014"), "Business Understanding", PortfolioSkillCategory.BusinessAndSoftSkills, false, 2),
            new(new Guid("1B7E5C7A-2B69-4E8A-A5D5-6E9E819A1015"), "Structured Problem Solving", PortfolioSkillCategory.BusinessAndSoftSkills, false, 3),
            new(new Guid("1B7E5C7A-2B69-4E8A-A5D5-6E9E819A1016"), "Workflow Awareness", PortfolioSkillCategory.BusinessAndSoftSkills, false, 4)
        ];
    }

    private sealed record PortfolioSkillSeedItem(
        Guid Id,
        string Name,
        PortfolioSkillCategory Category,
        bool IsPrimary,
        int DisplayOrder);
}
