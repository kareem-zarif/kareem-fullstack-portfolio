using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace kareem_fullstack_portfolio.Dashboard;

public interface IAdminDashboardAppService : IApplicationService
{
    Task<AdminDashboardOverviewDto> GetOverviewAsync();
}
