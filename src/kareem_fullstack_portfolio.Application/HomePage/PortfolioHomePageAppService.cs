using System.Linq;
using System.Threading.Tasks;
using kareem_fullstack_portfolio.PortfolioIdentity;
using Microsoft.AspNetCore.Authorization;

namespace kareem_fullstack_portfolio.HomePage;

[AllowAnonymous]
public class PortfolioHomePageAppService : kareem_fullstack_portfolioAppService, IPortfolioHomePageAppService
{
    private readonly IPortfolioHomePageDefinitionProvider _homePageDefinitionProvider;

    public PortfolioHomePageAppService(IPortfolioHomePageDefinitionProvider homePageDefinitionProvider)
    {
        _homePageDefinitionProvider = homePageDefinitionProvider;
    }

    public Task<PortfolioHomePageDto> GetAsync()
    {
        var definition = _homePageDefinitionProvider.Get();

        return Task.FromResult(new PortfolioHomePageDto
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
            FeaturedProjects = definition.FeaturedProjects
                .OrderBy(project => project.DisplayOrder)
                .Select(CreateFeaturedProjectDto)
                .ToList(),
            ErpExperienceHighlight = CreateErpExperienceHighlightDto(definition.ErpExperienceHighlight),
            BusinessValueItems = definition.BusinessValueItems
                .OrderBy(item => item.DisplayOrder)
                .Select(CreateBusinessValueDto)
                .ToList(),
            ContactCallToAction = CreateContactCallToActionDto(definition.ContactCallToAction)
        });
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

    private PortfolioHomeFeaturedProjectDto CreateFeaturedProjectDto(PortfolioHomeFeaturedProjectDefinition project)
    {
        return new PortfolioHomeFeaturedProjectDto
        {
            Type = project.Type,
            TypeLabel = L[$"Enum:PortfolioHomeFeaturedProjectType.{project.Type}"],
            Title = project.Title,
            Slug = project.Slug,
            ShortSummary = project.ShortSummary,
            BusinessValue = project.BusinessValue,
            TechStack = project.TechStack.ToList(),
            GitHubUrl = project.GitHubUrl,
            HasGitHubLink = !string.IsNullOrWhiteSpace(project.GitHubUrl),
            LiveDemoUrl = project.LiveDemoUrl,
            HasLiveDemoLink = !string.IsNullOrWhiteSpace(project.LiveDemoUrl),
            CaseStudyRoute = project.CaseStudyRoute,
            IsFeatured = project.IsFeatured,
            DisplayOrder = project.DisplayOrder
        };
    }

    private PortfolioHomeErpExperienceHighlightDto CreateErpExperienceHighlightDto(PortfolioHomeErpExperienceHighlightDefinition highlight)
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
            ProjectRoute = highlight.ProjectRoute
        };
    }

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
