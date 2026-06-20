namespace kareem_fullstack_portfolio.HomePage;

public class PortfolioHomeProfessionalLinkDto
{
    public PortfolioHomeProfessionalLinkType Type { get; set; }

    public string Label { get; set; } = string.Empty;

    public string Url { get; set; } = string.Empty;

    public bool IsExternal { get; set; }

    public int DisplayOrder { get; set; }
}
