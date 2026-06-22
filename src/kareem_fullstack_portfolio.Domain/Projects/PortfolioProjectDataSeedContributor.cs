using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Uow;

namespace kareem_fullstack_portfolio.Projects;

public class PortfolioProjectDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IRepository<PortfolioProject, Guid> _portfolioProjectRepository;
    private readonly IPortfolioProjectCaseStudyDefinitionProvider _portfolioProjectCaseStudyDefinitionProvider;

    public PortfolioProjectDataSeedContributor(
        IRepository<PortfolioProject, Guid> portfolioProjectRepository,
        IPortfolioProjectCaseStudyDefinitionProvider portfolioProjectCaseStudyDefinitionProvider)
    {
        _portfolioProjectRepository = portfolioProjectRepository;
        _portfolioProjectCaseStudyDefinitionProvider = portfolioProjectCaseStudyDefinitionProvider;
    }

    [UnitOfWork]
    public async Task SeedAsync(DataSeedContext context)
    {
        var existingProjects = await _portfolioProjectRepository.GetListAsync();
        var existingSlugs = existingProjects
            .Select(project => project.Slug)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var seed in GetSeeds())
        {
            if (existingSlugs.Contains(seed.Slug))
            {
                continue;
            }

            var project = new PortfolioProject(
                seed.Id,
                seed.Title,
                seed.Slug,
                seed.ProjectType,
                seed.ShortSummary,
                seed.BusinessValue,
                seed.TechStack,
                seed.IsFeatured,
                isActive: true,
                seed.GitHubUrl,
                seed.LiveDemoUrl,
                seed.DisplayOrder);

            var caseStudyDefinition = _portfolioProjectCaseStudyDefinitionProvider.FindBySlug(seed.Slug);

            if (caseStudyDefinition is not null)
            {
                project.SetCaseStudyContent(PortfolioProjectCaseStudyContent.FromDefinition(caseStudyDefinition));
            }

            await _portfolioProjectRepository.InsertAsync(project, autoSave: true);
        }
    }

    private static IReadOnlyList<PortfolioProjectSeedItem> GetSeeds()
    {
        return
        [
            new(
                new Guid("7F0A4E6D-6A65-4C59-A28D-9B6F5D341001"),
                "Enterprise ERP System",
                "enterprise-erp-system",
                PortfolioProjectType.ErpSystem,
                "A business system inspired by ERP products such as Daftra, focused on secure modules, approvals, reporting, and day-to-day operations.",
                "Shows the ability to connect APIs, Angular screens, permissions, and workflow rules in one enterprise-style product recruiters can evaluate seriously.",
                new List<string> { "ASP.NET Core", "Angular", "SQL Server", "EF Core", "ABP" },
                true,
                null,
                null,
                1),
            new(
                new Guid("7F0A4E6D-6A65-4C59-A28D-9B6F5D341002"),
                "Factory-to-Customer E-Commerce Platform",
                "factory-to-customer-ecommerce-platform",
                PortfolioProjectType.ECommercePlatform,
                "An e-commerce platform designed to connect factory inventory, pricing, and order flows directly with customer-facing purchasing journeys.",
                "Demonstrates product catalog modeling, checkout workflow thinking, and backend contracts that support both business administration and customer UX.",
                new List<string> { "ASP.NET Core", "Angular", "SQL Server", "EF Core", "REST APIs" },
                false,
                null,
                null,
                2),
            new(
                new Guid("7F0A4E6D-6A65-4C59-A28D-9B6F5D341003"),
                "Cafeteria System",
                "cafeteria-system",
                PortfolioProjectType.OperationsSystem,
                "An operations-focused system for managing cafeteria orders, daily demand, and staff-facing workflows without turning the product into a simple demo app.",
                "Highlights practical module design, reliable data handling, and UI-ready APIs for internal business processes with clear operational value.",
                new List<string> { "ASP.NET Core", "Angular", "SQL Server", "EF Core" },
                false,
                null,
                null,
                3),
            new(
                new Guid("7F0A4E6D-6A65-4C59-A28D-9B6F5D341004"),
                "Full Stack Portfolio Project",
                "full-stack-portfolio-project",
                PortfolioProjectType.PortfolioPlatform,
                "A portfolio platform that presents projects as business case studies with a structured public site and an admin-ready backend foundation.",
                "Demonstrates product thinking, layered backend design, and an Angular-ready API surface where the backend owns permissions, validation, and localization.",
                new List<string> { "ASP.NET Core", "Angular", "ABP", "REST APIs" },
                true,
                null,
                null,
                4),
            new(
                new Guid("7F0A4E6D-6A65-4C59-A28D-9B6F5D341005"),
                "Database Entities",
                "story-4-2-database-entities",
                PortfolioProjectType.PortfolioPlatform,
                "Epic 4, Story 4.2 for the portfolio platform: a database-first slice that turns content, settings, and contact flows into maintainable EF Core entities.",
                "Shows practical backend ownership through Code First modeling, SQL Server persistence, ABP conventions, and real endpoint support for the Angular frontend.",
                new List<string> { "ASP.NET Core", "EF Core", "ABP", "SQL Server", "Angular 21" },
                false,
                null,
                null,
                5)
        ];
    }

    private sealed record PortfolioProjectSeedItem(
        Guid Id,
        string Title,
        string Slug,
        PortfolioProjectType ProjectType,
        string ShortSummary,
        string BusinessValue,
        IReadOnlyCollection<string> TechStack,
        bool IsFeatured,
        string? GitHubUrl,
        string? LiveDemoUrl,
        int DisplayOrder);
}
