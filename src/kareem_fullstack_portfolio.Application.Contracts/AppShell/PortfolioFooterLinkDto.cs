namespace kareem_fullstack_portfolio.AppShell;

public class PortfolioFooterLinkDto
{
    public PortfolioFooterLinkType Type { get; set; }

    public string Label { get; set; } = string.Empty;

    public string Url { get; set; } = string.Empty;

    public bool IsExternal { get; set; }

    public bool IsConfigured { get; set; }

    public int DisplayOrder { get; set; }
}
