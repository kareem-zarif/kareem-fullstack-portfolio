namespace kareem_fullstack_portfolio.AppShell;

public class PortfolioRouteDefinition
{
    public PortfolioRouteType Type { get; }

    public string Path { get; }

    public PortfolioLayoutType Layout { get; }

    public bool RequiresAuthentication { get; }

    public string? RequiredPermissionName { get; }

    public bool IsNavigationVisible { get; }

    public bool ExactMatch { get; }

    public int DisplayOrder { get; }

    public PortfolioRouteDefinition(
        PortfolioRouteType type,
        string path,
        PortfolioLayoutType layout,
        bool requiresAuthentication,
        string? requiredPermissionName,
        bool isNavigationVisible,
        bool exactMatch,
        int displayOrder)
    {
        Type = type;
        Path = path;
        Layout = layout;
        RequiresAuthentication = requiresAuthentication;
        RequiredPermissionName = requiredPermissionName;
        IsNavigationVisible = isNavigationVisible;
        ExactMatch = exactMatch;
        DisplayOrder = displayOrder;
    }
}
