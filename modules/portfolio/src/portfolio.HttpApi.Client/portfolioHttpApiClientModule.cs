using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.Http.Client;
using Volo.Abp.Modularity;
using Volo.Abp.VirtualFileSystem;

namespace portfolio;

[DependsOn(
    typeof(portfolioApplicationContractsModule),
    typeof(AbpHttpClientModule))]
public class portfolioHttpApiClientModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        context.Services.AddHttpClientProxies(
            typeof(portfolioApplicationContractsModule).Assembly,
            portfolioRemoteServiceConsts.RemoteServiceName
        );

        Configure<AbpVirtualFileSystemOptions>(options =>
        {
            options.FileSets.AddEmbedded<portfolioHttpApiClientModule>();
        });

    }
}
