using kareem_fullstack_portfolio.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

namespace kareem_fullstack_portfolio.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(kareem_fullstack_portfolioEntityFrameworkCoreModule),
    typeof(kareem_fullstack_portfolioApplicationContractsModule)
)]
public class kareem_fullstack_portfolioDbMigratorModule : AbpModule
{
}
