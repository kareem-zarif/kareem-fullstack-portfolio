using System.Collections.Generic;

namespace kareem_fullstack_portfolio.HomePage;

public class PortfolioHomeTechStackCardDto
{
    public PortfolioHomeTechStackCardType Type { get; set; }

    public string Label { get; set; } = string.Empty;

    public string Headline { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;

    public List<string> Technologies { get; set; } = [];

    public int DisplayOrder { get; set; }
}
