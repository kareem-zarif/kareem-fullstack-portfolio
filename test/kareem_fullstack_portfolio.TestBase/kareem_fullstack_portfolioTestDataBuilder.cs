using System.Threading.Tasks;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.MultiTenancy;

namespace kareem_fullstack_portfolio;

public class kareem_fullstack_portfolioTestDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private readonly ICurrentTenant _currentTenant;

    public kareem_fullstack_portfolioTestDataSeedContributor(ICurrentTenant currentTenant)
    {
        _currentTenant = currentTenant;
    }

    public Task SeedAsync(DataSeedContext context)
    {
        /* Seed additional test data... */

        using (_currentTenant.Change(context?.TenantId))
        {
            return Task.CompletedTask;
        }
    }
}
