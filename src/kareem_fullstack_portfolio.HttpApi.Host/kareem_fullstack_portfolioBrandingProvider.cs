using Microsoft.Extensions.Localization;
using kareem_fullstack_portfolio.Localization;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Ui.Branding;

namespace kareem_fullstack_portfolio;

[Dependency(ReplaceServices = true)]
public class kareem_fullstack_portfolioBrandingProvider : DefaultBrandingProvider
{
    private IStringLocalizer<kareem_fullstack_portfolioResource> _localizer;

    public kareem_fullstack_portfolioBrandingProvider(IStringLocalizer<kareem_fullstack_portfolioResource> localizer)
    {
        _localizer = localizer;
    }

    public override string AppName => _localizer["AppName"];
}
