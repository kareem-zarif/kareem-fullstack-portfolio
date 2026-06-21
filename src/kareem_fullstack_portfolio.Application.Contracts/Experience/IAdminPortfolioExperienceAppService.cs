using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace kareem_fullstack_portfolio.Experience;

public interface IAdminPortfolioExperienceAppService : IApplicationService
{
    Task<IReadOnlyList<PortfolioExperienceAdminDto>> GetListAsync();

    Task<PortfolioExperienceAdminDto> GetAsync(Guid id);

    Task<PortfolioExperienceAdminDto> CreateAsync(CreateUpdatePortfolioExperienceDto input);

    Task<PortfolioExperienceAdminDto> UpdateAsync(Guid id, CreateUpdatePortfolioExperienceDto input);

    Task DeleteAsync(Guid id);
}
