using Volo.Abp.Domain;
using Volo.Abp.Modularity;

namespace portfolio;

[DependsOn(
    typeof(AbpDddDomainModule),
    typeof(portfolioDomainSharedModule)
)]
public class portfolioDomainModule : AbpModule
{

}
