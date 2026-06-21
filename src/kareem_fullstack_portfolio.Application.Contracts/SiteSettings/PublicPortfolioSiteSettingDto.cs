namespace kareem_fullstack_portfolio.SiteSettings;

public class PublicPortfolioSiteSettingDto
{
    public string Key { get; set; } = string.Empty;

    public string Value { get; set; } = string.Empty;

    public PortfolioSiteSettingValueType ValueType { get; set; }

    public string ValueTypeLabel { get; set; } = string.Empty;

    public int DisplayOrder { get; set; }
}
