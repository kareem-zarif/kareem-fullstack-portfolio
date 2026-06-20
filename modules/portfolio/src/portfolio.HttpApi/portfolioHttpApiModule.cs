using Localization.Resources.AbpUi;
using portfolio.Localization;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.Localization;
using Volo.Abp.Modularity;
using Microsoft.Extensions.DependencyInjection;

namespace portfolio;

[DependsOn(
    typeof(portfolioApplicationContractsModule),
    typeof(AbpAspNetCoreMvcModule))]
public class portfolioHttpApiModule : AbpModule
{
    public override void PreConfigureServices(ServiceConfigurationContext context)
    {
        PreConfigure<IMvcBuilder>(mvcBuilder =>
        {
            mvcBuilder.AddApplicationPartIfNotExists(typeof(portfolioHttpApiModule).Assembly);
        });
    }

    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        Configure<AbpLocalizationOptions>(options =>
        {
            options.Resources
                .Get<portfolioResource>()
                .AddBaseTypes(typeof(AbpUiResource));
        });
    }
}
