using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;

namespace kareem_fullstack_portfolio.Projects;

[AllowAnonymous]
[Route("api/projects")]
public class PortfolioProjectAppService : PortfolioProjectAppServiceBase, IPortfolioProjectAppService
{
    public PortfolioProjectAppService(
        IRepository<PortfolioProject, Guid> portfolioProjectRepository,
        IPortfolioProjectCaseStudyDefinitionProvider portfolioProjectCaseStudyDefinitionProvider)
        : base(portfolioProjectRepository, portfolioProjectCaseStudyDefinitionProvider)
    {
    }

    [HttpGet]
    public async Task<PortfolioProjectListDto> GetListAsync(GetPortfolioProjectListInput input)
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
            AvailableProjectTypes = CreateProjectTypeOptions(activeProjects),
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

    [HttpGet("{slug}")]
    public async Task<PortfolioProjectCaseStudyDto> GetBySlugAsync(string slug)
    {
        var normalizedSlug = slug.IsNullOrWhiteSpace()
            ? null
            : slug.Trim().ToLowerInvariant();

        if (normalizedSlug is null)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectNotFoundBySlug)
                .WithData("Slug", slug ?? string.Empty);
        }

        var project = await GetActiveProjectBySlugAsync(normalizedSlug);
        var definition = project is null
            ? null
            : ResolveCaseStudyDefinition(project);

        if (project is null || definition is null)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectNotFoundBySlug)
                .WithData("Slug", normalizedSlug);
        }

        var links = CreateLinks(project);

        return new PortfolioProjectCaseStudyDto
        {
            Id = project.Id,
            Title = project.Title,
            Slug = project.Slug,
            CaseStudyRoute = project.GetCaseStudyRoute(),
            ProjectType = project.ProjectType,
            ProjectTypeLabel = L[$"Enum:PortfolioProjectType.{project.ProjectType}"],
            ShortSummary = project.ShortSummary,
            BusinessValue = project.BusinessValue,
            Overview = definition.Overview,
            BusinessProblem = definition.BusinessProblem,
            Solution = definition.Solution,
            RoleSummary = definition.RoleSummary,
            RoleResponsibilities = definition.RoleResponsibilities.ToList(),
            TechStack = project.TechStack
                .OrderBy(technology => technology.DisplayOrder)
                .Select(technology => technology.Name)
                .ToList(),
            KeyFeatures = definition.KeyFeatures.ToList(),
            ArchitectureNotes = definition.ArchitectureNotes.ToList(),
            HighlightCards = definition.HighlightCards
                .OrderBy(card => card.DisplayOrder)
                .Select(MapHighlightCardDto)
                .ToList(),
            GalleryItems = definition.GalleryItems
                .OrderBy(item => item.DisplayOrder)
                .Select(MapGalleryItemDto)
                .ToList(),
            Results = definition.Results.ToList(),
            Links = links,
            Sections = CreateSections(project, definition, links),
            IsFeatured = project.IsFeatured
        };
    }

    private async Task<List<PortfolioProject>> GetActiveProjectsAsync()
    {
        var projects = await GetProjectsWithDetailsAsync();

        return projects
            .Where(project => project.IsActive)
            .OrderByDescending(project => project.IsFeatured)
            .ThenBy(project => project.DisplayOrder)
            .ThenBy(project => project.Title)
            .ToList();
    }

    private async Task<PortfolioProject?> GetActiveProjectBySlugAsync(string slug)
    {
        var projects = await GetProjectsWithDetailsAsync();

        return projects.FirstOrDefault(project => project.IsActive && project.Slug == slug);
    }

    private PortfolioProjectCardDto MapCardDto(PortfolioProject project)
    {
        var shortSummaryPreview = CreatePreview(project.ShortSummary, PortfolioProjectConsts.SummaryPreviewMaxLength, out var isShortSummaryTruncated);
        var businessValuePreview = CreatePreview(project.BusinessValue, PortfolioProjectConsts.BusinessValuePreviewMaxLength, out var isBusinessValueTruncated);
        var hasCaseStudyLink = ResolveCaseStudyDefinition(project) is not null;

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
            CaseStudyRoute = hasCaseStudyLink ? project.GetCaseStudyRoute() : string.Empty,
            HasCaseStudyLink = hasCaseStudyLink,
            DisplayOrder = project.DisplayOrder
        };
    }

    private PortfolioProjectCaseStudyGalleryItemDto MapGalleryItemDto(PortfolioProjectCaseStudyGalleryItemDefinition item)
    {
        return new PortfolioProjectCaseStudyGalleryItemDto
        {
            Type = item.Type,
            TypeLabel = L[$"Enum:PortfolioProjectCaseStudyGalleryItemType.{item.Type}"],
            Title = item.Title,
            Summary = item.Summary,
            ImageUrl = item.ImageUrl,
            DisplayOrder = item.DisplayOrder
        };
    }

    private PortfolioProjectCaseStudyHighlightCardDto MapHighlightCardDto(PortfolioProjectCaseStudyHighlightCardDefinition card)
    {
        return new PortfolioProjectCaseStudyHighlightCardDto
        {
            Type = card.Type,
            Label = L[$"Enum:PortfolioProjectCaseStudyHighlightType.{card.Type}"],
            Title = card.Title,
            Summary = card.Summary,
            DisplayOrder = card.DisplayOrder
        };
    }

    private List<PortfolioProjectCaseStudyLinkDto> CreateLinks(PortfolioProject project)
    {
        var links = new List<PortfolioProjectCaseStudyLinkDto>();

        if (!project.GitHubUrl.IsNullOrWhiteSpace())
        {
            links.Add(new PortfolioProjectCaseStudyLinkDto
            {
                Type = PortfolioProjectCaseStudyLinkType.GitHub,
                Label = L[$"Enum:PortfolioProjectCaseStudyLinkType.{PortfolioProjectCaseStudyLinkType.GitHub}"],
                Url = project.GitHubUrl!,
                IsExternal = true,
                DisplayOrder = 1
            });
        }

        if (!project.LiveDemoUrl.IsNullOrWhiteSpace())
        {
            links.Add(new PortfolioProjectCaseStudyLinkDto
            {
                Type = PortfolioProjectCaseStudyLinkType.LiveDemo,
                Label = L[$"Enum:PortfolioProjectCaseStudyLinkType.{PortfolioProjectCaseStudyLinkType.LiveDemo}"],
                Url = project.LiveDemoUrl!,
                IsExternal = true,
                DisplayOrder = 2
            });
        }

        return links;
    }

    private List<PortfolioProjectCaseStudySectionDto> CreateSections(
        PortfolioProject project,
        PortfolioProjectCaseStudyDefinition definition,
        List<PortfolioProjectCaseStudyLinkDto> links)
    {
        return
        [
            CreateSection(PortfolioProjectCaseStudySectionType.Overview, !definition.Overview.IsNullOrWhiteSpace(), 1),
            CreateSection(PortfolioProjectCaseStudySectionType.BusinessProblem, !definition.BusinessProblem.IsNullOrWhiteSpace(), 2),
            CreateSection(PortfolioProjectCaseStudySectionType.Solution, !definition.Solution.IsNullOrWhiteSpace(), 3),
            CreateSection(PortfolioProjectCaseStudySectionType.KareemRole, !definition.RoleSummary.IsNullOrWhiteSpace() || definition.RoleResponsibilities.Count > 0, 4),
            CreateSection(PortfolioProjectCaseStudySectionType.TechStack, project.TechStack.Count > 0, 5),
            CreateSection(PortfolioProjectCaseStudySectionType.KeyFeatures, definition.KeyFeatures.Count > 0, 6),
            CreateSection(PortfolioProjectCaseStudySectionType.ArchitectureNotes, definition.ArchitectureNotes.Count > 0, 7),
            CreateSection(PortfolioProjectCaseStudySectionType.Gallery, definition.GalleryItems.Count > 0, 8),
            CreateSection(PortfolioProjectCaseStudySectionType.ResultsImpact, definition.Results.Count > 0, 9),
            CreateSection(PortfolioProjectCaseStudySectionType.Links, links.Count > 0, 10)
        ];
    }

    private PortfolioProjectCaseStudySectionDto CreateSection(
        PortfolioProjectCaseStudySectionType type,
        bool isVisible,
        int displayOrder)
    {
        return new PortfolioProjectCaseStudySectionDto
        {
            Type = type,
            Label = L[$"Enum:PortfolioProjectCaseStudySectionType.{type}"],
            IsVisible = isVisible,
            DisplayOrder = displayOrder
        };
    }
    private static string? NormalizeTechnology(string? technology)
    {
        return technology.IsNullOrWhiteSpace()
            ? null
            : technology.Trim();
    }
}
