using kareem_fullstack_portfolio.Localization;
using Volo.Abp.Application.Services;

namespace kareem_fullstack_portfolio;

/* Inherit your application services from this class.
 */
public abstract class kareem_fullstack_portfolioAppService : ApplicationService
{
    protected kareem_fullstack_portfolioAppService()
    {
        LocalizationResource = typeof(kareem_fullstack_portfolioResource);
    }
}
