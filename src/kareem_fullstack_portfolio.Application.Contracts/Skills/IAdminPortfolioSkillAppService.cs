using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace kareem_fullstack_portfolio.Skills;

public interface IAdminPortfolioSkillAppService : IApplicationService
{
    Task<IReadOnlyList<PortfolioSkillAdminDto>> GetListAsync();

    Task<PortfolioSkillAdminDto> GetAsync(Guid id);

    Task<PortfolioSkillAdminDto> CreateAsync(CreateUpdatePortfolioSkillDto input);

    Task<PortfolioSkillAdminDto> UpdateAsync(Guid id, CreateUpdatePortfolioSkillDto input);

    Task DeleteAsync(Guid id);
}
