using kareem_fullstack_portfolio.PortfolioIdentity;

namespace kareem_fullstack_portfolio.HomePage;

public class PortfolioHomeContactCallToActionDto
{
    public string Title { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;

    public PortfolioCallToActionDto PrimaryAction { get; set; } = new();
}
