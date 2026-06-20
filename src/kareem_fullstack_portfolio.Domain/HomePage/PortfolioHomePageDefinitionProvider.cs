using System.Collections.Generic;
using System.Linq;
using kareem_fullstack_portfolio.PortfolioIdentity;
using Volo.Abp.DependencyInjection;

namespace kareem_fullstack_portfolio.HomePage;

public class PortfolioHomePageDefinitionProvider : IPortfolioHomePageDefinitionProvider, ITransientDependency
{
    private readonly IPortfolioIdentityDefinitionProvider _identityDefinitionProvider;

    public PortfolioHomePageDefinitionProvider(IPortfolioIdentityDefinitionProvider identityDefinitionProvider)
    {
        _identityDefinitionProvider = identityDefinitionProvider;
    }

    public PortfolioHomePageDefinition Get()
    {
        var identity = _identityDefinitionProvider.Get();
        var contactAction = identity.CallToActions.Single(action => action.Type == PortfolioCallToActionType.ContactMe);
        var gitHubAction = identity.CallToActions.Single(action => action.Type == PortfolioCallToActionType.GitHub);

        var definition = new PortfolioHomePageDefinition(
            identity,
            professionalLinks: new List<PortfolioHomeProfessionalLinkDefinition>
            {
                new(PortfolioHomeProfessionalLinkType.GitHub, gitHubAction.Url, true, 1),
                new(PortfolioHomeProfessionalLinkType.LinkedIn, "https://www.linkedin.com/", true, 2)
            },
            techStackCards: new List<PortfolioHomeTechStackCardDefinition>
            {
                new(
                    PortfolioHomeTechStackCardType.BackendApis,
                    "ASP.NET Core APIs with ABP-style application boundaries",
                    "Backend services own routing, authorization, validation, localized errors, and workflow-safe business rules.",
                    new List<string> { "ASP.NET Core", "ABP", "Application Services" },
                    1),
                new(
                    PortfolioHomeTechStackCardType.AngularFrontends,
                    "Angular frontends built for recruiters, admins, and business users",
                    "Public and admin experiences are shaped around clear contracts, responsive layouts, and maintainable UI flows.",
                    new List<string> { "Angular", "TypeScript", "Responsive UI" },
                    2),
                new(
                    PortfolioHomeTechStackCardType.DataAndReporting,
                    "SQL Server and EF Core for durable business data",
                    "Entities, queries, and persistence are designed to support reporting, traceability, and future feature growth.",
                    new List<string> { "SQL Server", "EF Core", "LINQ" },
                    3),
                new(
                    PortfolioHomeTechStackCardType.SecurityAndWorkflows,
                    "Secure permissions and business workflow thinking",
                    "Authentication, role-based access, and workflow-aware backend logic keep enterprise scenarios reliable.",
                    new List<string> { "Authentication", "Authorization", "Workflow Design" },
                    4)
            },
            featuredProjects: new List<PortfolioHomeFeaturedProjectDefinition>
            {
                new(
                    PortfolioHomeFeaturedProjectType.EnterpriseErpSystem,
                    "Enterprise ERP System",
                    "enterprise-erp-system",
                    "A business system inspired by ERP products such as Daftra, focused on secure modules, reporting, and operational workflows.",
                    "Shows the ability to connect APIs, Angular screens, permissions, and workflow rules in one enterprise-style product.",
                    new List<string> { "ASP.NET Core", "Angular", "SQL Server", "EF Core", "ABP" },
                    null,
                    null,
                    "/projects/enterprise-erp-system",
                    true,
                    1),
                new(
                    PortfolioHomeFeaturedProjectType.FullStackPortfolioProject,
                    "Full Stack Portfolio Project",
                    "full-stack-portfolio-project",
                    "A portfolio platform that presents projects as business case studies with a structured public site and admin-ready backend.",
                    "Demonstrates product thinking, layered backend design, and an Angular-ready API surface for future content management.",
                    new List<string> { "ASP.NET Core", "Angular", "ABP", "REST APIs" },
                    null,
                    null,
                    "/projects/full-stack-portfolio-project",
                    true,
                    2)
            },
            erpExperienceHighlight: new PortfolioHomeErpExperienceHighlightDefinition(
                "ERP experience that connects frontend, backend, data, and secure workflows",
                "The ERP case study is the strongest proof of business-oriented full-stack delivery, combining APIs, Angular screens, permissions, reporting, and operational thinking.",
                new List<PortfolioHomeErpCapabilityType>
                {
                    PortfolioHomeErpCapabilityType.AspNetCoreApis,
                    PortfolioHomeErpCapabilityType.AngularFrontend,
                    PortfolioHomeErpCapabilityType.SqlServerAndEfCore,
                    PortfolioHomeErpCapabilityType.RoleBasedPermissions,
                    PortfolioHomeErpCapabilityType.Reporting,
                    PortfolioHomeErpCapabilityType.Authentication,
                    PortfolioHomeErpCapabilityType.BusinessWorkflows,
                    PortfolioHomeErpCapabilityType.AbpLayeredArchitecture
                },
                "The backend remains the source of truth for permissions, validation, localization, and state-aware workflow rules.",
                "/projects/enterprise-erp-system"),
            businessValueItems: new List<PortfolioHomeBusinessValueDefinition>
            {
                new(
                    PortfolioHomeBusinessValueType.BusinessWorkflowThinking,
                    "Business workflow thinking",
                    "Requirements are translated into modules, validation rules, approvals, and reporting-friendly data structures instead of one-off screens.",
                    1),
                new(
                    PortfolioHomeBusinessValueType.FullStackDelivery,
                    "Full-stack delivery with clean contracts",
                    "Angular experiences are prepared around backend-owned DTOs and application services so public and admin views can evolve safely.",
                    2),
                new(
                    PortfolioHomeBusinessValueType.SecurityAndPermissions,
                    "Security and permission awareness",
                    "Authentication, authorization, and backend-enforced business rules are treated as product requirements, not polish tasks.",
                    3)
            },
            contactCallToAction: new PortfolioHomeContactCallToActionDefinition(
                "Need a developer who can think in modules, workflows, and business outcomes?",
                "Let's talk about ERP-style systems, internal tools, admin dashboards, or client-facing products built on solid backend rules.",
                contactAction));

        definition.EnsureValid();

        return definition;
    }
}
