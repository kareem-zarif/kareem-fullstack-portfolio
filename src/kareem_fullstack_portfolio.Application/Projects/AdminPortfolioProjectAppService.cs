using System;
using System.Linq;
using System.Threading.Tasks;
using kareem_fullstack_portfolio.Permissions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Domain.Repositories;

namespace kareem_fullstack_portfolio.Projects;

[Authorize(kareem_fullstack_portfolioPermissions.Admin.Access)]
[Route("api/admin/projects")]
public class AdminPortfolioProjectAppService : PortfolioProjectAppServiceBase, IAdminPortfolioProjectAppService
{
    public AdminPortfolioProjectAppService(
        IRepository<PortfolioProject, Guid> portfolioProjectRepository,
        IPortfolioProjectCaseStudyDefinitionProvider portfolioProjectCaseStudyDefinitionProvider)
        : base(portfolioProjectRepository, portfolioProjectCaseStudyDefinitionProvider)
    {
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Projects.Default)]
    [HttpGet]
    public async Task<AdminPortfolioProjectListDto> GetListAsync(GetAdminPortfolioProjectListInput input)
    {
        input ??= new GetAdminPortfolioProjectListInput();

        var projects = await GetProjectsWithDetailsAsync();
        var normalizedSearchText = NormalizeSearchText(input.SearchText);

        var filteredProjects = projects
            .Where(project => !input.ProjectType.HasValue || project.ProjectType == input.ProjectType.Value)
            .Where(project => !input.IsActive.HasValue || project.IsActive == input.IsActive.Value)
            .Where(project => !input.IsFeatured.HasValue || project.IsFeatured == input.IsFeatured.Value)
            .Where(project => string.IsNullOrWhiteSpace(normalizedSearchText) || MatchesSearch(project, normalizedSearchText))
            .OrderByDescending(project => project.IsActive)
            .ThenBy(project => project.DisplayOrder)
            .ThenBy(project => project.Title)
            .ToList();

        return new AdminPortfolioProjectListDto
        {
            Items = filteredProjects
                .Select(MapAdminListItemDto)
                .ToList(),
            AvailableProjectTypes = CreateProjectTypeOptions(projects),
            AppliedSearchText = normalizedSearchText,
            AppliedProjectType = input.ProjectType,
            AppliedIsActive = input.IsActive,
            AppliedIsFeatured = input.IsFeatured,
            TotalCount = filteredProjects.Count
        };
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Projects.Default)]
    [HttpGet("{id:guid}")]
    public async Task<PortfolioProjectAdminDto> GetAsync(Guid id)
    {
        var project = await GetProjectAsync(id);
        return MapAdminDto(project);
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Projects.Manage)]
    [HttpPost]
    public async Task<PortfolioProjectAdminDto> CreateAsync(CreateUpdatePortfolioProjectDto input)
    {
        await EnsureUniqueSlugAsync(input.Slug);

        var project = new PortfolioProject(
            GuidGenerator.Create(),
            input.Title,
            input.Slug,
            input.ProjectType,
            input.ShortSummary,
            input.BusinessValue,
            input.TechStack,
            input.IsFeatured,
            input.IsActive,
            input.GitHubUrl,
            input.GitHubFrontendUrl,
            input.LiveDemoUrl,
            input.DisplayOrder);

        project.SetCaseStudyContent(MapCaseStudyContent(input.CaseStudy));

        await PortfolioProjectRepository.InsertAsync(project, autoSave: true);

        return MapAdminDto(project);
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Projects.Manage)]
    [HttpPut("{id:guid}")]
    public async Task<PortfolioProjectAdminDto> UpdateAsync(Guid id, CreateUpdatePortfolioProjectDto input)
    {
        var project = await GetProjectAsync(id);

        await EnsureUniqueSlugAsync(input.Slug, id);

        project.Update(
            input.Title,
            input.Slug,
            input.ProjectType,
            input.ShortSummary,
            input.BusinessValue,
            input.TechStack,
            input.IsFeatured,
            input.IsActive,
            input.GitHubUrl,
            input.GitHubFrontendUrl,
            input.LiveDemoUrl,
            input.DisplayOrder);

        project.SetCaseStudyContent(MapCaseStudyContent(input.CaseStudy));

        await PortfolioProjectRepository.UpdateAsync(project, autoSave: true);

        return MapAdminDto(project);
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Projects.Manage)]
    [HttpPatch("{id:guid}/publication-status")]
    public async Task<PortfolioProjectAdminDto> SetPublicationStatusAsync(Guid id, SetPortfolioProjectPublicationStatusDto input)
    {
        var project = await GetProjectAsync(id);
        project.SetActive(input.IsActive);

        await PortfolioProjectRepository.UpdateAsync(project, autoSave: true);

        return MapAdminDto(project);
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Projects.Manage)]
    [HttpPatch("{id:guid}/featured-status")]
    public async Task<PortfolioProjectAdminDto> SetFeaturedStatusAsync(Guid id, SetPortfolioProjectFeaturedStatusDto input)
    {
        var project = await GetProjectAsync(id);
        project.SetFeatured(input.IsFeatured);

        await PortfolioProjectRepository.UpdateAsync(project, autoSave: true);

        return MapAdminDto(project);
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Projects.Manage)]
    [HttpDelete("{id:guid}")]
    public async Task DeleteAsync(Guid id)
    {
        await GetProjectAsync(id);
        await PortfolioProjectRepository.DeleteAsync(id, autoSave: true);
    }

    private static bool MatchesSearch(PortfolioProject project, string searchText)
    {
        return project.Title.Contains(searchText, StringComparison.OrdinalIgnoreCase) ||
               project.Slug.Contains(searchText, StringComparison.OrdinalIgnoreCase) ||
               project.ShortSummary.Contains(searchText, StringComparison.OrdinalIgnoreCase) ||
               project.BusinessValue.Contains(searchText, StringComparison.OrdinalIgnoreCase) ||
               project.TechStack.Any(technology => technology.Name.Contains(searchText, StringComparison.OrdinalIgnoreCase));
    }
}
