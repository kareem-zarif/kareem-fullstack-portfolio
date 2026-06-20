namespace kareem_fullstack_portfolio.PortfolioIdentity;

public class PortfolioCallToActionDto
{
    public PortfolioCallToActionType Type { get; set; }

    public string Label { get; set; } = string.Empty;

    public string Url { get; set; } = string.Empty;

    public bool IsExternal { get; set; }

    public int DisplayOrder { get; set; }

    public string Style { get; set; } = string.Empty;
}
