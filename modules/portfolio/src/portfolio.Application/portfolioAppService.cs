using portfolio.Localization;
using Volo.Abp.Application.Services;

namespace portfolio;

public abstract class portfolioAppService : ApplicationService
{
    protected portfolioAppService()
    {
        LocalizationResource = typeof(portfolioResource);
        ObjectMapperContext = typeof(portfolioApplicationModule);
    }
}
