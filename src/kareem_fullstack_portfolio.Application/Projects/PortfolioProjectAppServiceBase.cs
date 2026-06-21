using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;

namespace kareem_fullstack_portfolio.Projects;

public abstract class PortfolioProjectAppServiceBase : kareem_fullstack_portfolioAppService
{
    protected readonly IRepository<PortfolioProject, Guid> PortfolioProjectRepository;
    protected readonly IPortfolioProjectCaseStudyDefinitionProvider PortfolioProjectCaseStudyDefinitionProvider;

    protected PortfolioProjectAppServiceBase(
        IRepository<PortfolioProject, Guid> portfolioProjectRepository,
        IPortfolioProjectCaseStudyDefinitionProvider portfolioProjectCaseStudyDefinitionProvider)
    {
        PortfolioProjectRepository = portfolioProjectRepository;
        PortfolioProjectCaseStudyDefinitionProvider = portfolioProjectCaseStudyDefinitionProvider;
    }

    protected async Task<List<PortfolioProject>> GetProjectsWithDetailsAsync()
    {
        var queryable = await PortfolioProjectRepository.WithDetailsAsync(project => project.TechStack);
        return await AsyncExecuter.ToListAsync(queryable);
    }

    protected async Task<PortfolioProject> GetProjectAsync(Guid id)
    {
        var queryable = await PortfolioProjectRepository.WithDetailsAsync(project => project.TechStack);
        var project = await AsyncExecuter.FirstOrDefaultAsync(queryable.Where(item => item.Id == id));

        if (project is not null)
        {
            return project;
        }

        throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectNotFound)
            .WithData("ProjectId", id);
    }

    protected async Task EnsureUniqueSlugAsync(string slug, Guid? excludedProjectId = null)
    {
        var normalizedSlug = NormalizeSlug(slug);
        var queryable = await PortfolioProjectRepository.GetQueryableAsync();

        var duplicateExists = await AsyncExecuter.AnyAsync(
            queryable.Where(project =>
                project.Slug.ToUpper() == normalizedSlug.ToUpper() &&
                (!excludedProjectId.HasValue || project.Id != excludedProjectId.Value)));

        if (!duplicateExists)
        {
            return;
        }

        throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectDuplicateSlug)
            .WithData("Slug", normalizedSlug);
    }

    protected PortfolioProjectAdminListItemDto MapAdminListItemDto(PortfolioProject project)
    {
        var shortSummaryPreview = CreatePreview(project.ShortSummary, PortfolioProjectConsts.SummaryPreviewMaxLength, out var isShortSummaryTruncated);
        var businessValuePreview = CreatePreview(project.BusinessValue, PortfolioProjectConsts.BusinessValuePreviewMaxLength, out var isBusinessValueTruncated);

        return new PortfolioProjectAdminListItemDto
        {
            Id = project.Id,
            Title = project.Title,
            Slug = project.Slug,
            ProjectType = project.ProjectType,
            ProjectTypeLabel = L[$"Enum:PortfolioProjectType.{project.ProjectType}"],
            ShortSummaryPreview = shortSummaryPreview,
            IsShortSummaryTruncated = isShortSummaryTruncated,
            BusinessValuePreview = businessValuePreview,
            IsBusinessValueTruncated = isBusinessValueTruncated,
            TechStack = project.TechStack
                .OrderBy(technology => technology.DisplayOrder)
                .Select(technology => technology.Name)
                .ToList(),
            IsFeatured = project.IsFeatured,
            IsActive = project.IsActive,
            HasCaseStudyContent = ResolveCaseStudyContent(project) is not null,
            CaseStudyRoute = project.GetCaseStudyRoute(),
            DisplayOrder = project.DisplayOrder
        };
    }

    protected PortfolioProjectAdminDto MapAdminDto(PortfolioProject project)
    {
        var resolvedCaseStudyContent = ResolveCaseStudyContent(project);
        var caseStudyContent = resolvedCaseStudyContent ?? new PortfolioProjectCaseStudyContent();
        var hasCaseStudyContent = resolvedCaseStudyContent is not null;

        return new PortfolioProjectAdminDto
        {
            Id = project.Id,
            Title = project.Title,
            Slug = project.Slug,
            ProjectType = project.ProjectType,
            ProjectTypeLabel = L[$"Enum:PortfolioProjectType.{project.ProjectType}"],
            ShortSummary = project.ShortSummary,
            BusinessValue = project.BusinessValue,
            TechStack = project.TechStack
                .OrderBy(technology => technology.DisplayOrder)
                .Select(technology => technology.Name)
                .ToList(),
            IsFeatured = project.IsFeatured,
            IsActive = project.IsActive,
            GitHubUrl = project.GitHubUrl,
            LiveDemoUrl = project.LiveDemoUrl,
            CaseStudyRoute = project.GetCaseStudyRoute(),
            HasCaseStudyContent = hasCaseStudyContent,
            DisplayOrder = project.DisplayOrder,
            CaseStudy = MapCaseStudyAdminDto(caseStudyContent)
        };
    }

    protected PortfolioProjectCaseStudyAdminDto MapCaseStudyAdminDto(PortfolioProjectCaseStudyContent content)
    {
        return new PortfolioProjectCaseStudyAdminDto
        {
            Overview = content.Overview,
            BusinessProblem = content.BusinessProblem,
            Solution = content.Solution,
            RoleSummary = content.RoleSummary,
            RoleResponsibilities = content.RoleResponsibilities?.ToList() ?? [],
            KeyFeatures = content.KeyFeatures?.ToList() ?? [],
            ArchitectureNotes = content.ArchitectureNotes?.ToList() ?? [],
            HighlightCards = (content.HighlightCards ?? [])
                .OrderBy(card => card.DisplayOrder)
                .Select(card => new PortfolioProjectCaseStudyHighlightCardDto
                {
                    Type = card.Type,
                    Label = L[$"Enum:PortfolioProjectCaseStudyHighlightType.{card.Type}"],
                    Title = card.Title,
                    Summary = card.Summary,
                    DisplayOrder = card.DisplayOrder
                })
                .ToList(),
            GalleryItems = (content.GalleryItems ?? [])
                .OrderBy(item => item.DisplayOrder)
                .Select(item => new PortfolioProjectCaseStudyGalleryItemDto
                {
                    Type = item.Type,
                    TypeLabel = L[$"Enum:PortfolioProjectCaseStudyGalleryItemType.{item.Type}"],
                    Title = item.Title,
                    Summary = item.Summary,
                    ImageUrl = item.ImageUrl,
                    DisplayOrder = item.DisplayOrder
                })
                .ToList(),
            Results = content.Results?.ToList() ?? []
        };
    }

    protected PortfolioProjectCaseStudyContent MapCaseStudyContent(CreateUpdatePortfolioProjectCaseStudyDto input)
    {
        return new PortfolioProjectCaseStudyContent
        {
            Overview = input.Overview,
            BusinessProblem = input.BusinessProblem,
            Solution = input.Solution,
            RoleSummary = input.RoleSummary,
            RoleResponsibilities = input.RoleResponsibilities?.ToList() ?? [],
            KeyFeatures = input.KeyFeatures?.ToList() ?? [],
            ArchitectureNotes = input.ArchitectureNotes?.ToList() ?? [],
            HighlightCards = input.HighlightCards?
                .Select(card => new PortfolioProjectCaseStudyHighlightCardContent
                {
                    Type = card.Type,
                    Title = card.Title,
                    Summary = card.Summary,
                    DisplayOrder = card.DisplayOrder
                })
                .ToList() ?? [],
            GalleryItems = input.GalleryItems?
                .Select(item => new PortfolioProjectCaseStudyGalleryItemContent
                {
                    Type = item.Type,
                    Title = item.Title,
                    Summary = item.Summary,
                    ImageUrl = item.ImageUrl,
                    DisplayOrder = item.DisplayOrder
                })
                .ToList() ?? [],
            Results = input.Results?.ToList() ?? []
        };
    }

    protected PortfolioProjectCaseStudyDefinition? ResolveCaseStudyDefinition(PortfolioProject project)
    {
        var caseStudyContent = project.GetCaseStudyContent();

        if (caseStudyContent is not null)
        {
            return caseStudyContent.ToDefinition(project.Slug);
        }

        return PortfolioProjectCaseStudyDefinitionProvider.FindBySlug(project.Slug);
    }

    protected PortfolioProjectCaseStudyContent? ResolveCaseStudyContent(PortfolioProject project)
    {
        var caseStudyContent = project.GetCaseStudyContent();

        if (caseStudyContent is not null)
        {
            return caseStudyContent;
        }

        var definition = PortfolioProjectCaseStudyDefinitionProvider.FindBySlug(project.Slug);
        return definition is null
            ? null
            : PortfolioProjectCaseStudyContent.FromDefinition(definition);
    }

    protected List<PortfolioProjectTypeFilterOptionDto> CreateProjectTypeOptions(IEnumerable<PortfolioProject> projects)
    {
        return projects
            .Select(project => project.ProjectType)
            .Distinct()
            .OrderBy(projectType => projectType)
            .Select(projectType => new PortfolioProjectTypeFilterOptionDto
            {
                Value = projectType,
                Label = L[$"Enum:PortfolioProjectType.{projectType}"]
            })
            .ToList();
    }

    protected static string CreatePreview(string value, int maxLength, out bool isTruncated)
    {
        if (value.Length <= maxLength)
        {
            isTruncated = false;
            return value;
        }

        isTruncated = true;
        return value[..(maxLength - 3)].TrimEnd() + "...";
    }

    protected static string? NormalizeSearchText(string? searchText)
    {
        return searchText.IsNullOrWhiteSpace()
            ? null
            : searchText.Trim();
    }

    protected static string NormalizeSlug(string? slug)
    {
        if (slug.IsNullOrWhiteSpace())
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectSlugRequired);
        }

        return slug.Trim().ToLowerInvariant();
    }
}
