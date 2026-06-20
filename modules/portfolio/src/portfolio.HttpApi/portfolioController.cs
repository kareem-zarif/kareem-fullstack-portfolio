using portfolio.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace portfolio;

public abstract class portfolioController : AbpControllerBase
{
    protected portfolioController()
    {
        LocalizationResource = typeof(portfolioResource);
    }
}
