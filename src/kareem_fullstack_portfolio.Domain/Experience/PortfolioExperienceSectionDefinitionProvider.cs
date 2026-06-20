using System.Collections.Generic;
using Volo.Abp.DependencyInjection;

namespace kareem_fullstack_portfolio.Experience;

public class PortfolioExperienceSectionDefinitionProvider : IPortfolioExperienceSectionDefinitionProvider, ITransientDependency
{
    public PortfolioExperienceSectionDefinition Get()
    {
        var definition = new PortfolioExperienceSectionDefinition(
            headline: "Professional journey presented as business-focused experience",
            summary: "The story moves from engineering foundations and analytical work into intensive .NET training and ERP-oriented full-stack delivery, using short highlights instead of long biography text.",
            timelineItems: new List<PortfolioExperienceTimelineItemDefinition>
            {
                new(
                    PortfolioExperienceTimelineItemType.EngineeringFoundation,
                    "Foundation",
                    "Engineering background built structured problem-solving habits",
                    "Engineering background",
                    "An engineering foundation strengthened systems thinking, analytical discipline, and comfort with structured problem solving before deeper software delivery work.",
                    "That foundation helps translate business requirements into organized solutions instead of treating features as isolated screens.",
                    new List<string> { "Systems thinking", "Structured analysis" },
                    false,
                    1),
                new(
                    PortfolioExperienceTimelineItemType.SearchAdsEvaluatorExperience,
                    "Analytical experience",
                    "Search Ads Evaluator work sharpened judgment and detail",
                    "Search Ads Evaluator",
                    "Evaluating search intent and result quality strengthened consistency, attention to detail, and user-focused decision making.",
                    "This previous non-software work is framed as transferable analytical value that supports product quality, prioritization, and business context.",
                    new List<string> { "Analytical review", "Quality judgment" },
                    false,
                    2),
                new(
                    PortfolioExperienceTimelineItemType.DotNetFullStackTraining,
                    "Software specialization",
                    "ITI .NET Full Stack training accelerated practical delivery",
                    "ITI .NET Full Stack track",
                    "Focused training across backend APIs, frontend development, data access, and project structure created a strong transition into full-stack implementation.",
                    "It added hands-on delivery practice for building maintainable business applications across the stack.",
                    new List<string> { "ASP.NET Core", "Angular", "SQL Server" },
                    false,
                    3),
                new(
                    PortfolioExperienceTimelineItemType.EnterpriseErpDelivery,
                    "Primary software experience",
                    "Enterprise ERP development is the main professional software experience",
                    "Enterprise ERP delivery",
                    "ERP-oriented delivery brought together secure APIs, Angular screens, reporting, permissions, and workflow-aware business logic in one business system.",
                    "This is the clearest proof of business-facing full-stack work, where the backend owns validation, visibility, permissions, and localized rules.",
                    new List<string> { "Permissions", "Reporting", "Workflow thinking" },
                    true,
                    4)
            },
            highlightBadges: new List<PortfolioExperienceHighlightDefinition>
            {
                new(PortfolioExperienceHighlightType.AnalyticalThinking, 1),
                new(PortfolioExperienceHighlightType.BusinessUnderstanding, 2),
                new(PortfolioExperienceHighlightType.StructuredProblemSolving, 3),
                new(PortfolioExperienceHighlightType.WorkflowAwareness, 4)
            });

        definition.EnsureValid();

        return definition;
    }
}
