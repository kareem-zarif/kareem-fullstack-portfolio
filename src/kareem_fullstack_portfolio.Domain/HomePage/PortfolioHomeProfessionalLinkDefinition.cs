namespace kareem_fullstack_portfolio.HomePage;

public class PortfolioHomeProfessionalLinkDefinition
{
    public PortfolioHomeProfessionalLinkType Type { get; }

    public string Url { get; }

    public bool IsExternal { get; }

    public int DisplayOrder { get; }

    public PortfolioHomeProfessionalLinkDefinition(
        PortfolioHomeProfessionalLinkType type,
        string url,
        bool isExternal,
        int displayOrder)
    {
        Type = type;
        Url = url;
        IsExternal = isExternal;
        DisplayOrder = displayOrder;
    }
}
