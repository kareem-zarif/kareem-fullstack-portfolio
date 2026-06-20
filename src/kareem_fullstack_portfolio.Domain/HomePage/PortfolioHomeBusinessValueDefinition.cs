namespace kareem_fullstack_portfolio.HomePage;

public class PortfolioHomeBusinessValueDefinition
{
    public PortfolioHomeBusinessValueType Type { get; }

    public string Title { get; }

    public string Summary { get; }

    public int DisplayOrder { get; }

    public PortfolioHomeBusinessValueDefinition(
        PortfolioHomeBusinessValueType type,
        string title,
        string summary,
        int displayOrder)
    {
        Type = type;
        Title = title;
        Summary = summary;
        DisplayOrder = displayOrder;
    }
}
