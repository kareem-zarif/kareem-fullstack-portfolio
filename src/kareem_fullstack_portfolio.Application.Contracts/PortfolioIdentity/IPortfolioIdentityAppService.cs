using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace kareem_fullstack_portfolio.PortfolioIdentity;

public interface IPortfolioIdentityAppService : IApplicationService
{
    Task<PortfolioIdentityDto> GetAsync();
}
