using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace kareem_fullstack_portfolio.Skills;

public interface IPublicPortfolioSkillAppService : IApplicationService
{
    Task<IReadOnlyList<PortfolioSkillCategoryDto>> GetListAsync();
}
