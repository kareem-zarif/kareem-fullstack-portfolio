using Volo.Abp.Modularity;

namespace kareem_fullstack_portfolio;

[DependsOn(
    typeof(kareem_fullstack_portfolioDomainModule),
    typeof(kareem_fullstack_portfolioTestBaseModule)
)]
public class kareem_fullstack_portfolioDomainTestModule : AbpModule
{

}
