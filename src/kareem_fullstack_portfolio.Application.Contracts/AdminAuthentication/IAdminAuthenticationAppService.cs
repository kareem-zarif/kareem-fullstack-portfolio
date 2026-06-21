using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace kareem_fullstack_portfolio.AdminAuthentication;

public interface IAdminAuthenticationAppService : IApplicationService
{
    Task<AdminLoginResultDto> LoginAsync(AdminLoginDto input);

    Task LogoutAsync();

    Task<AdminCurrentUserDto> GetCurrentAsync();
}
