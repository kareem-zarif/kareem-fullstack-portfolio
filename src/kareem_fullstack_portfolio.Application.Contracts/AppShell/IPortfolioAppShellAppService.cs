using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace kareem_fullstack_portfolio.AppShell;

public interface IPortfolioAppShellAppService : IApplicationService
{
    Task<PortfolioAppShellDto> GetPublicAsync();

    Task<PortfolioAppShellDto> GetAdminAsync();
}
