using Volo.Abp.Application;
using Volo.Abp.Modularity;
using Volo.Abp.Authorization;

namespace portfolio;

[DependsOn(
    typeof(portfolioDomainSharedModule),
    typeof(AbpDddApplicationContractsModule),
    typeof(AbpAuthorizationModule)
    )]
public class portfolioApplicationContractsModule : AbpModule
{

}
