using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using kareem_fullstack_portfolio.Projects;
using kareem_fullstack_portfolio.PortfolioIdentity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;

namespace kareem_fullstack_portfolio.HomePage;

[AllowAnonymous]
[Route("api/app/portfolio-home-page")]
public class PortfolioHomePageAppService : kareem_fullstack_portfolioAppService, IPortfolioHomePageAppService
{
    private readonly IPortfolioHomePageDefinitionProvider _homePageDefinitionProvider;
    private readonly IRepository<PortfolioProject, Guid> _portfolioProjectRepository;
    private readonly IPortfolioProjectCaseStudyDefinitionProvider _portfolioProjectCaseStudyDefinitionProvider;

    public PortfolioHomePageAppService(
        IPortfolioHomePageDefinitionProvider homePageDefinitionProvider,
        IRepository<PortfolioProject, Guid> portfolioProjectRepository,
        IPortfolioProjectCaseStudyDefinitionProvider portfolioProjectCaseStudyDefinitionProvider)
    {
        _homePageDefinitionProvider = homePageDefinitionProvider;
        _portfolioProjectRepository = portfolioProjectRepository;
        _portfolioProjectCaseStudyDefinitionProvider = portfolioProjectCaseStudyDefinitionProvider;
    }

    [HttpGet]
    public async Task<PortfolioHomePageDto> GetAsync()
    {
        var definition = _homePageDefinitionProvider.Get();
        var featuredProjects = await GetFeaturedProjectsAsync(definition);
        var erpProject = GetRequiredFeaturedProject(featuredProjects, PortfolioHomeFeaturedProjectType.EnterpriseErpSystem);
        var erpCaseStudy = _portfolioProjectCaseStudyDefinitionProvider.FindBySlug(erpProject.Slug)
            ?? throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectNotFoundBySlug)
                .WithData("Slug", erpProject.Slug);

        return new PortfolioHomePageDto
        {
            Identity = CreateIdentityDto(definition.Identity),
            ProfessionalLinks = definition.ProfessionalLinks
                .OrderBy(link => link.DisplayOrder)
                .Select(CreateProfessionalLinkDto)
                .ToList(),
            TechStackCards = definition.TechStackCards
                .OrderBy(card => card.DisplayOrder)
                .Select(CreateTechStackCardDto)
                .ToList(),
            FeaturedProjects = featuredProjects
                .OrderBy(project => project.Definition.DisplayOrder)
                .Select(item => CreateFeaturedProjectDto(item.Definition, item.Project))
                .ToList(),
            ErpExperienceHighlight = CreateErpExperienceHighlightDto(definition.ErpExperienceHighlight, erpProject, erpCaseStudy),
            BusinessValueItems = definition.BusinessValueItems
                .OrderBy(item => item.DisplayOrder)
                .Select(CreateBusinessValueDto)
                .ToList(),
            ContactCallToAction = CreateContactCallToActionDto(definition.ContactCallToAction)
        };
    }

    private PortfolioIdentityDto CreateIdentityDto(PortfolioIdentityDefinition identity)
    {
        return new PortfolioIdentityDto
        {
            FullName = identity.FullName,
            ProfessionalTitle = identity.ProfessionalTitle,
            MainMessage = identity.MainMessage,
            BusinessSummary = identity.BusinessSummary,
            VisualDirection = identity.VisualDirection,
            TargetAudiences = identity.TargetAudiences
                .Select(audience => new PortfolioTargetAudienceDto
                {
                    Type = audience,
                    Label = L[$"Enum:PortfolioTargetAudienceType.{audience}"]
                })
                .ToList(),
            CallToActions = identity.CallToActions
                .OrderBy(callToAction => callToAction.DisplayOrder)
                .Select(CreateCallToActionDto)
                .ToList()
        };
    }

    private PortfolioCallToActionDto CreateCallToActionDto(PortfolioCallToActionDefinition callToAction)
    {
        return new PortfolioCallToActionDto
        {
            Type = callToAction.Type,
            Label = L[$"Enum:PortfolioCallToActionType.{callToAction.Type}"],
            Url = callToAction.Url,
            IsExternal = callToAction.IsExternal,
            DisplayOrder = callToAction.DisplayOrder,
            Style = callToAction.Style
        };
    }

    private PortfolioHomeProfessionalLinkDto CreateProfessionalLinkDto(PortfolioHomeProfessionalLinkDefinition link)
    {
        return new PortfolioHomeProfessionalLinkDto
        {
            Type = link.Type,
            Label = L[$"Enum:PortfolioHomeProfessionalLinkType.{link.Type}"],
            Url = link.Url,
            IsExternal = link.IsExternal,
            DisplayOrder = link.DisplayOrder
        };
    }

    private PortfolioHomeTechStackCardDto CreateTechStackCardDto(PortfolioHomeTechStackCardDefinition card)
    {
        return new PortfolioHomeTechStackCardDto
        {
            Type = card.Type,
            Label = L[$"Enum:PortfolioHomeTechStackCardType.{card.Type}"],
            Headline = card.Headline,
            Summary = card.Summary,
            Technologies = card.Technologies.ToList(),
            DisplayOrder = card.DisplayOrder
        };
    }

    private PortfolioHomeFeaturedProjectDto CreateFeaturedProjectDto(PortfolioHomeFeaturedProjectDefinition definition, PortfolioProject project)
    {
        return new PortfolioHomeFeaturedProjectDto
        {
            Type = definition.Type,
            TypeLabel = L[$"Enum:PortfolioHomeFeaturedProjectType.{definition.Type}"],
            Title = project.Title,
            Slug = project.Slug,
            ShortSummary = project.ShortSummary,
            BusinessValue = project.BusinessValue,
            TechStack = project.TechStack
                .OrderBy(technology => technology.DisplayOrder)
                .Select(technology => technology.Name)
                .ToList(),
            GitHubUrl = project.GitHubUrl,
            HasGitHubLink = !string.IsNullOrWhiteSpace(project.GitHubUrl),
            LiveDemoUrl = project.LiveDemoUrl,
            HasLiveDemoLink = !string.IsNullOrWhiteSpace(project.LiveDemoUrl),
            CaseStudyRoute = _portfolioProjectCaseStudyDefinitionProvider.HasDefinition(project.Slug)
                ? project.GetCaseStudyRoute()
                : string.Empty,
            IsFeatured = project.IsFeatured,
            DisplayOrder = definition.DisplayOrder
        };
    }

    private PortfolioHomeErpExperienceHighlightDto CreateErpExperienceHighlightDto(
        PortfolioHomeErpExperienceHighlightDefinition highlight,
        PortfolioProject erpProject,
        PortfolioProjectCaseStudyDefinition caseStudy)
    {
        return new PortfolioHomeErpExperienceHighlightDto
        {
            Headline = highlight.Headline,
            Summary = highlight.Summary,
            Capabilities = highlight.Capabilities
                .Select(capability => new PortfolioHomeErpCapabilityDto
                {
                    Type = capability,
                    Label = L[$"Enum:PortfolioHomeErpCapabilityType.{capability}"]
                })
                .ToList(),
            ArchitectureNote = highlight.ArchitectureNote,
            HighlightCards = caseStudy.HighlightCards
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
            ProjectRoute = erpProject.GetCaseStudyRoute()
        };
    }

    private async Task<IReadOnlyList<FeaturedProjectItem>> GetFeaturedProjectsAsync(PortfolioHomePageDefinition definition)
    {
        var featuredDefinitions = definition.FeaturedProjects
            .OrderBy(project => project.DisplayOrder)
            .ToList();

        var slugs = featuredDefinitions
            .Select(project => project.Slug)
            .Where(slug => !slug.IsNullOrWhiteSpace())
            .Distinct()
            .ToList();

        var queryable = await _portfolioProjectRepository.WithDetailsAsync(project => project.TechStack);
        var projects = await AsyncExecuter.ToListAsync(
            queryable.Where(project => project.IsActive && project.IsFeatured && slugs.Contains(project.Slug)));

        return featuredDefinitions
            .Select(definitionItem => new FeaturedProjectItem(
                definitionItem,
                projects.FirstOrDefault(project => project.Slug == definitionItem.Slug)
                    ?? throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.HomePageMissingFeaturedProject)
                        .WithData("FeaturedProjectType", definitionItem.Type.ToString())))
            .ToList();
    }

    private static PortfolioProject GetRequiredFeaturedProject(
        IReadOnlyList<FeaturedProjectItem> featuredProjects,
        PortfolioHomeFeaturedProjectType type)
    {
        return featuredProjects
            .FirstOrDefault(project => project.Definition.Type == type)?.Project
            ?? throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.HomePageMissingFeaturedProject)
                .WithData("FeaturedProjectType", type.ToString());
    }

    private sealed record FeaturedProjectItem(
        PortfolioHomeFeaturedProjectDefinition Definition,
        PortfolioProject Project);

    private PortfolioHomeBusinessValueDto CreateBusinessValueDto(PortfolioHomeBusinessValueDefinition item)
    {
        return new PortfolioHomeBusinessValueDto
        {
            Type = item.Type,
            Label = L[$"Enum:PortfolioHomeBusinessValueType.{item.Type}"],
            Title = item.Title,
            Summary = item.Summary,
            DisplayOrder = item.DisplayOrder
        };
    }

    private PortfolioHomeContactCallToActionDto CreateContactCallToActionDto(PortfolioHomeContactCallToActionDefinition contactCallToAction)
    {
        return new PortfolioHomeContactCallToActionDto
        {
            Title = contactCallToAction.Title,
            Summary = contactCallToAction.Summary,
            PrimaryAction = CreateCallToActionDto(contactCallToAction.PrimaryAction)
        };
    }
}
