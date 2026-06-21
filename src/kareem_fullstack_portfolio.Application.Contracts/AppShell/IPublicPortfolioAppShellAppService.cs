using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace kareem_fullstack_portfolio.AppShell;

public interface IPublicPortfolioAppShellAppService : IApplicationService
{
    Task<PortfolioAppShellDto> GetAsync();
}
