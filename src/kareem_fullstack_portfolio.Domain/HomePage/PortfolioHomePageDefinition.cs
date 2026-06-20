using System;
using System.Collections.Generic;
using System.Linq;
using kareem_fullstack_portfolio.PortfolioIdentity;
using Volo.Abp;

namespace kareem_fullstack_portfolio.HomePage;

public class PortfolioHomePageDefinition
{
    public PortfolioIdentityDefinition Identity { get; }

    public IReadOnlyList<PortfolioHomeProfessionalLinkDefinition> ProfessionalLinks { get; }

    public IReadOnlyList<PortfolioHomeTechStackCardDefinition> TechStackCards { get; }

    public IReadOnlyList<PortfolioHomeFeaturedProjectDefinition> FeaturedProjects { get; }

    public PortfolioHomeErpExperienceHighlightDefinition ErpExperienceHighlight { get; }

    public IReadOnlyList<PortfolioHomeBusinessValueDefinition> BusinessValueItems { get; }

    public PortfolioHomeContactCallToActionDefinition ContactCallToAction { get; }

    public PortfolioHomePageDefinition(
        PortfolioIdentityDefinition identity,
        IReadOnlyList<PortfolioHomeProfessionalLinkDefinition> professionalLinks,
        IReadOnlyList<PortfolioHomeTechStackCardDefinition> techStackCards,
        IReadOnlyList<PortfolioHomeFeaturedProjectDefinition> featuredProjects,
        PortfolioHomeErpExperienceHighlightDefinition erpExperienceHighlight,
        IReadOnlyList<PortfolioHomeBusinessValueDefinition> businessValueItems,
        PortfolioHomeContactCallToActionDefinition contactCallToAction)
    {
        Identity = identity;
        ProfessionalLinks = professionalLinks;
        TechStackCards = techStackCards;
        FeaturedProjects = featuredProjects;
        ErpExperienceHighlight = erpExperienceHighlight;
        BusinessValueItems = businessValueItems;
        ContactCallToAction = contactCallToAction;
    }

    public void EnsureValid()
    {
        Identity.EnsureValid();
        EnsureTargetAudienceCoverage();
        EnsureSpecializationCoverage();
        EnsureTechStackCards();
        EnsureFeaturedProjects();
        EnsureProfessionalLinks();
        EnsureErpExperienceHighlight();
        EnsureBusinessValueSection();
        EnsureContactCallToAction();
    }

    private void EnsureTargetAudienceCoverage()
    {
        if (Identity.TargetAudiences.All(audience => audience != PortfolioTargetAudienceType.Recruiters))
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.HomePageMissingRequiredAudience)
                .WithData("TargetAudience", PortfolioTargetAudienceType.Recruiters.ToString());
        }

        if (Identity.TargetAudiences.All(audience => audience != PortfolioTargetAudienceType.FreelanceClients))
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.HomePageMissingRequiredAudience)
                .WithData("TargetAudience", PortfolioTargetAudienceType.FreelanceClients.ToString());
        }
    }

    private void EnsureSpecializationCoverage()
    {
        if (!Identity.ProfessionalTitle.Contains(".NET", StringComparison.OrdinalIgnoreCase) ||
            TechStackCards.All(card => card.Type != PortfolioHomeTechStackCardType.AngularFrontends))
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.HomePageMustShowDotNetAndAngularSpecialization);
        }
    }

    private void EnsureTechStackCards()
    {
        foreach (var cardType in Enum.GetValues<PortfolioHomeTechStackCardType>())
        {
            if (TechStackCards.All(card => card.Type != cardType))
            {
                throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.HomePageMissingRequiredTechStackCard)
                    .WithData("TechStackCardType", cardType.ToString());
            }
        }
    }

    private void EnsureFeaturedProjects()
    {
        if (FeaturedProjects.Count < 2)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.HomePageMustIncludeMultipleFeaturedProjects);
        }

        if (FeaturedProjects.All(project => project.Type != PortfolioHomeFeaturedProjectType.EnterpriseErpSystem))
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.HomePageMissingFeaturedProject)
                .WithData("FeaturedProjectType", PortfolioHomeFeaturedProjectType.EnterpriseErpSystem.ToString());
        }
    }

    private void EnsureProfessionalLinks()
    {
        foreach (var linkType in Enum.GetValues<PortfolioHomeProfessionalLinkType>())
        {
            if (ProfessionalLinks.All(link => link.Type != linkType || link.Url.IsNullOrWhiteSpace()))
            {
                throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.HomePageMissingProfessionalLink)
                    .WithData("ProfessionalLinkType", linkType.ToString());
            }
        }
    }

    private void EnsureErpExperienceHighlight()
    {
        if (ErpExperienceHighlight.ProjectRoute.IsNullOrWhiteSpace())
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.HomePageErpHighlightProjectRouteRequired);
        }

        foreach (var capabilityType in Enum.GetValues<PortfolioHomeErpCapabilityType>())
        {
            if (ErpExperienceHighlight.Capabilities.All(capability => capability != capabilityType))
            {
                throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.HomePageMissingErpCapability)
                    .WithData("ErpCapabilityType", capabilityType.ToString());
            }
        }
    }

    private void EnsureBusinessValueSection()
    {
        foreach (var valueType in Enum.GetValues<PortfolioHomeBusinessValueType>())
        {
            if (BusinessValueItems.All(item => item.Type != valueType))
            {
                throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.HomePageMissingBusinessValueItem)
                    .WithData("BusinessValueType", valueType.ToString());
            }
        }
    }

    private void EnsureContactCallToAction()
    {
        if (ContactCallToAction.Title.IsNullOrWhiteSpace() ||
            ContactCallToAction.Summary.IsNullOrWhiteSpace() ||
            ContactCallToAction.PrimaryAction.Type != PortfolioCallToActionType.ContactMe ||
            ContactCallToAction.PrimaryAction.Url.IsNullOrWhiteSpace())
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.HomePageContactCallToActionInvalid);
        }
    }
}
