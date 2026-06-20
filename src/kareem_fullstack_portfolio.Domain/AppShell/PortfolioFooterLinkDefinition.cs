namespace kareem_fullstack_portfolio.AppShell;

public class PortfolioFooterLinkDefinition
{
    public PortfolioFooterLinkType Type { get; }

    public string Url { get; }

    public bool IsExternal { get; }

    public int DisplayOrder { get; }

    public PortfolioFooterLinkDefinition(
        PortfolioFooterLinkType type,
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
