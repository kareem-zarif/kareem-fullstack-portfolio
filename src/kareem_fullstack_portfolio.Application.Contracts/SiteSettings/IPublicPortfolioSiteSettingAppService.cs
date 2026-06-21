using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace kareem_fullstack_portfolio.SiteSettings;

public interface IPublicPortfolioSiteSettingAppService : IApplicationService
{
    Task<IReadOnlyList<PublicPortfolioSiteSettingDto>> GetListAsync();
}
