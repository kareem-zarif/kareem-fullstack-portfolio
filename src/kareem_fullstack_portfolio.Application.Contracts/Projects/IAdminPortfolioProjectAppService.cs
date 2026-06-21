using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace kareem_fullstack_portfolio.Projects;

public interface IAdminPortfolioProjectAppService : IApplicationService
{
    Task<AdminPortfolioProjectListDto> GetListAsync(GetAdminPortfolioProjectListInput input);

    Task<PortfolioProjectAdminDto> GetAsync(Guid id);

    Task<PortfolioProjectAdminDto> CreateAsync(CreateUpdatePortfolioProjectDto input);

    Task<PortfolioProjectAdminDto> UpdateAsync(Guid id, CreateUpdatePortfolioProjectDto input);

    Task<PortfolioProjectAdminDto> SetPublicationStatusAsync(Guid id, SetPortfolioProjectPublicationStatusDto input);

    Task<PortfolioProjectAdminDto> SetFeaturedStatusAsync(Guid id, SetPortfolioProjectFeaturedStatusDto input);

    Task DeleteAsync(Guid id);
}
