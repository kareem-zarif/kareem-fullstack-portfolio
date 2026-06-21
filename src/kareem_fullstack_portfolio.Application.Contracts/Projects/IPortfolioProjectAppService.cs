using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace kareem_fullstack_portfolio.Projects;

public interface IPortfolioProjectAppService : IApplicationService
{
    Task<PortfolioProjectListDto> GetPublicListAsync(GetPortfolioProjectListInput input);
}
