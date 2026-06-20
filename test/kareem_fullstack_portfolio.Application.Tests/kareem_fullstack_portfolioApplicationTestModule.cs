using Volo.Abp.Modularity;

namespace kareem_fullstack_portfolio;

[DependsOn(
    typeof(kareem_fullstack_portfolioApplicationModule),
    typeof(kareem_fullstack_portfolioDomainTestModule)
)]
public class kareem_fullstack_portfolioApplicationTestModule : AbpModule
{

}
