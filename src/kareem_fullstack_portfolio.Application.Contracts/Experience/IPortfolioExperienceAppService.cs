using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace kareem_fullstack_portfolio.Experience;

public interface IPortfolioExperienceAppService : IApplicationService
{
    Task<PortfolioExperienceSectionDto> GetAsync();
}
