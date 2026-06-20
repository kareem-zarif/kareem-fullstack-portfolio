using kareem_fullstack_portfolio.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace kareem_fullstack_portfolio.Controllers;

/* Inherit your controllers from this class.
 */
public abstract class kareem_fullstack_portfolioController : AbpControllerBase
{
    protected kareem_fullstack_portfolioController()
    {
        LocalizationResource = typeof(kareem_fullstack_portfolioResource);
    }
}
