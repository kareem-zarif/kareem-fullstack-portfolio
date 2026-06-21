using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace kareem_fullstack_portfolio.ContactMessages;

public interface IPublicPortfolioContactAppService : IApplicationService
{
    Task SubmitAsync(CreatePortfolioContactMessageDto input);
}
