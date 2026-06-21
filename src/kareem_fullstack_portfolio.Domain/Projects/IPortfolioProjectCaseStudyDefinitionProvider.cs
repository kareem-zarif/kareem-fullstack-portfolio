using System.Collections.Generic;

namespace kareem_fullstack_portfolio.Projects;

public interface IPortfolioProjectCaseStudyDefinitionProvider
{
    IReadOnlyDictionary<string, PortfolioProjectCaseStudyDefinition> GetAll();

    PortfolioProjectCaseStudyDefinition? FindBySlug(string slug);

    bool HasDefinition(string slug);
}
