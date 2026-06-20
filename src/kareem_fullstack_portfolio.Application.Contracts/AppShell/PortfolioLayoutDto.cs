namespace kareem_fullstack_portfolio.AppShell;

public class PortfolioLayoutDto
{
    public PortfolioLayoutType Type { get; set; }

    public string Label { get; set; } = string.Empty;

    public bool IsAdmin { get; set; }
}
