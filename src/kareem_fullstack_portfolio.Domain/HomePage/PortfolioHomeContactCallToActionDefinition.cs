using kareem_fullstack_portfolio.PortfolioIdentity;

namespace kareem_fullstack_portfolio.HomePage;

public class PortfolioHomeContactCallToActionDefinition
{
    public string Title { get; }

    public string Summary { get; }

    public PortfolioCallToActionDefinition PrimaryAction { get; }

    public PortfolioHomeContactCallToActionDefinition(
        string title,
        string summary,
        PortfolioCallToActionDefinition primaryAction)
    {
        Title = title;
        Summary = summary;
        PrimaryAction = primaryAction;
    }
}
