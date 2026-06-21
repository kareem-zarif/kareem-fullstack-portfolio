using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;

namespace kareem_fullstack_portfolio.Projects;

[AllowAnonymous]
public class PortfolioProjectAppService : kareem_fullstack_portfolioAppService, IPortfolioProjectAppService
{
    private readonly IRepository<PortfolioProject, Guid> _portfolioProjectRepository;

    public PortfolioProjectAppService(IRepository<PortfolioProject, Guid> portfolioProjectRepository)
    {
        _portfolioProjectRepository = portfolioProjectRepository;
    }

    public async Task<PortfolioProjectListDto> GetPublicListAsync(GetPortfolioProjectListInput input)
    {
        input ??= new GetPortfolioProjectListInput();

        var activeProjects = await GetActiveProjectsAsync();
        var normalizedTechnology = NormalizeTechnology(input.Technology);

        var filteredProjects = activeProjects
            .Where(project => !input.ProjectType.HasValue || project.ProjectType == input.ProjectType.Value)
            .Where(project => normalizedTechnology.IsNullOrWhiteSpace() ||
                              project.TechStack.Any(technology => technology.Name.Equals(normalizedTechnology, StringComparison.OrdinalIgnoreCase)))
            .ToList();

        return new PortfolioProjectListDto
        {
            Items = filteredProjects
                .Select(MapCardDto)
                .ToList(),
            AvailableProjectTypes = activeProjects
                .Select(project => project.ProjectType)
                .Distinct()
                .OrderBy(projectType => projectType)
                .Select(projectType => new PortfolioProjectTypeFilterOptionDto
                {
                    Value = projectType,
                    Label = L[$"Enum:PortfolioProjectType.{projectType}"]
                })
                .ToList(),
            AvailableTechnologies = activeProjects
                .SelectMany(project => project.TechStack)
                .OrderBy(technology => technology.DisplayOrder)
                .ThenBy(technology => technology.Name)
                .Select(technology => technology.Name)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList(),
            AppliedProjectType = input.ProjectType,
            AppliedTechnology = normalizedTechnology,
            HasActiveFilters = input.ProjectType.HasValue || !normalizedTechnology.IsNullOrWhiteSpace()
        };
    }

    private async Task<List<PortfolioProject>> GetActiveProjectsAsync()
    {
        var queryable = await _portfolioProjectRepository.WithDetailsAsync(project => project.TechStack);

        return await AsyncExecuter.ToListAsync(
            queryable
                .Where(project => project.IsActive)
                .OrderByDescending(project => project.IsFeatured)
                .ThenBy(project => project.DisplayOrder)
                .ThenBy(project => project.Title));
    }

    private PortfolioProjectCardDto MapCardDto(PortfolioProject project)
    {
        var shortSummaryPreview = CreatePreview(project.ShortSummary, PortfolioProjectConsts.SummaryPreviewMaxLength, out var isShortSummaryTruncated);
        var businessValuePreview = CreatePreview(project.BusinessValue, PortfolioProjectConsts.BusinessValuePreviewMaxLength, out var isBusinessValueTruncated);

        return new PortfolioProjectCardDto
        {
            Id = project.Id,
            Title = project.Title,
            Slug = project.Slug,
            ProjectType = project.ProjectType,
            ProjectTypeLabel = L[$"Enum:PortfolioProjectType.{project.ProjectType}"],
            ShortSummary = project.ShortSummary,
            ShortSummaryPreview = shortSummaryPreview,
            IsShortSummaryTruncated = isShortSummaryTruncated,
            BusinessValue = project.BusinessValue,
            BusinessValuePreview = businessValuePreview,
            IsBusinessValueTruncated = isBusinessValueTruncated,
            TechStack = project.TechStack
                .OrderBy(technology => technology.DisplayOrder)
                .Select(technology => technology.Name)
                .ToList(),
            IsFeatured = project.IsFeatured,
            GitHubUrl = project.GitHubUrl,
            HasGitHubLink = !project.GitHubUrl.IsNullOrWhiteSpace(),
            LiveDemoUrl = project.LiveDemoUrl,
            HasLiveDemoLink = !project.LiveDemoUrl.IsNullOrWhiteSpace(),
            CaseStudyRoute = project.GetCaseStudyRoute(),
            HasCaseStudyLink = true,
            DisplayOrder = project.DisplayOrder
        };
    }

    private static string CreatePreview(string value, int maxLength, out bool isTruncated)
    {
        if (value.Length <= maxLength)
        {
            isTruncated = false;
            return value;
        }

        isTruncated = true;
        return value[..(maxLength - 3)].TrimEnd() + "...";
    }

    private static string? NormalizeTechnology(string? technology)
    {
        return technology.IsNullOrWhiteSpace()
            ? null
            : technology.Trim();
    }
}
