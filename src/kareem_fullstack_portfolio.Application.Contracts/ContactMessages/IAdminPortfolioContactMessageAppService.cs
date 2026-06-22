using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace kareem_fullstack_portfolio.ContactMessages;

public interface IAdminPortfolioContactMessageAppService : IApplicationService
{
    Task<AdminPortfolioContactMessageListDto> GetListAsync(GetAdminPortfolioContactMessageListInput input);

    Task<PortfolioContactMessageAdminDto> GetAsync(Guid id);

    Task<PortfolioContactMessageAdminDto> SetReadStatusAsync(Guid id, SetPortfolioContactMessageReadStatusDto input);

    Task DeleteAsync(Guid id);
}
