using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace kareem_fullstack_portfolio.Data;

/* This is used if database provider does't define
 * Ikareem_fullstack_portfolioDbSchemaMigrator implementation.
 */
public class Nullkareem_fullstack_portfolioDbSchemaMigrator : Ikareem_fullstack_portfolioDbSchemaMigrator, ITransientDependency
{
    public Task MigrateAsync()
    {
        return Task.CompletedTask;
    }
}
