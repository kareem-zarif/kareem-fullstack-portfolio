using System.Collections.Generic;
using Volo.Abp.DependencyInjection;

namespace kareem_fullstack_portfolio.PortfolioIdentity;

public class PortfolioIdentityDefinitionProvider : IPortfolioIdentityDefinitionProvider, ITransientDependency
{
    public PortfolioIdentityDefinition Get()
    {
        var definition = new PortfolioIdentityDefinition(
            fullName: "Kareem Zarif",
            professionalTitle: "Business-Oriented .NET Full Stack Developer",
            mainMessage: "I build business systems, not just screens.",
            businessSummary: "I design and implement enterprise-style web applications with ASP.NET Core, ABP, Angular, SQL Server, Entity Framework Core, authentication, permissions, and business workflow thinking.",
            visualDirection: "Professional, modern, clean, confident SaaS / ERP product experience.",
            targetAudiences: new List<PortfolioTargetAudienceType>
            {
                PortfolioTargetAudienceType.Recruiters,
                PortfolioTargetAudienceType.SoftwareCompanies,
                PortfolioTargetAudienceType.FreelanceClients,
                PortfolioTargetAudienceType.TechnicalLeads,
                PortfolioTargetAudienceType.BusinessOwners
            },
            callToActions: new List<PortfolioCallToActionDefinition>
            {
                new(PortfolioCallToActionType.ViewProjects, "/projects", false, 1, "primary"),
                new(PortfolioCallToActionType.DownloadCv, "/assets/kareem-zarif-cv.pdf", false, 2, "secondary"),
                new(PortfolioCallToActionType.ContactMe, "/contact", false, 3, "secondary"),
                new(PortfolioCallToActionType.GitHub, "https://github.com/", true, 4, "link")
            });

        definition.EnsureValid();

        return definition;
    }
}
