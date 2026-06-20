using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace kareem_fullstack_portfolio.HomePage;

public interface IPortfolioHomePageAppService : IApplicationService
{
    Task<PortfolioHomePageDto> GetAsync();
}
