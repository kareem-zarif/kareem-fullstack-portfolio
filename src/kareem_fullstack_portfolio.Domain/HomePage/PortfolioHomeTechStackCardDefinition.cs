using System.Collections.Generic;

namespace kareem_fullstack_portfolio.HomePage;

public class PortfolioHomeTechStackCardDefinition
{
    public PortfolioHomeTechStackCardType Type { get; }

    public string Headline { get; }

    public string Summary { get; }

    public IReadOnlyList<string> Technologies { get; }

    public int DisplayOrder { get; }

    public PortfolioHomeTechStackCardDefinition(
        PortfolioHomeTechStackCardType type,
        string headline,
        string summary,
        IReadOnlyList<string> technologies,
        int displayOrder)
    {
        Type = type;
        Headline = headline;
        Summary = summary;
        Technologies = technologies;
        DisplayOrder = displayOrder;
    }
}
