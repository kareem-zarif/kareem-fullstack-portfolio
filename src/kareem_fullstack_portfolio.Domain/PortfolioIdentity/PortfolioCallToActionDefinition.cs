using kareem_fullstack_portfolio.PortfolioIdentity;

namespace kareem_fullstack_portfolio.PortfolioIdentity;

public class PortfolioCallToActionDefinition
{
    public PortfolioCallToActionType Type { get; }

    public string Url { get; }

    public bool IsExternal { get; }

    public int DisplayOrder { get; }

    public string Style { get; }

    public PortfolioCallToActionDefinition(
        PortfolioCallToActionType type,
        string url,
        bool isExternal,
        int displayOrder,
        string style)
    {
        Type = type;
        Url = url;
        IsExternal = isExternal;
        DisplayOrder = displayOrder;
        Style = style;
    }
}
