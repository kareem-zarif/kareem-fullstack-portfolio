using kareem_fullstack_portfolio.Localization;
using Volo.Abp.AuditLogging;
using Volo.Abp.BackgroundJobs;
using Volo.Abp.FeatureManagement;
using Volo.Abp.Identity;
using Volo.Abp.Localization;
using Volo.Abp.Localization.ExceptionHandling;
using Volo.Abp.Validation.Localization;
using Volo.Abp.Modularity;
using Volo.Abp.PermissionManagement;
using Volo.Abp.SettingManagement;
using Volo.Abp.VirtualFileSystem;
using Volo.Abp.OpenIddict;
using Volo.Abp.BlobStoring.Database;

namespace kareem_fullstack_portfolio;

[DependsOn(
    typeof(AbpAuditLoggingDomainSharedModule),
    typeof(AbpBackgroundJobsDomainSharedModule),
    typeof(AbpFeatureManagementDomainSharedModule),
    typeof(AbpPermissionManagementDomainSharedModule),
    typeof(AbpSettingManagementDomainSharedModule),
    typeof(AbpIdentityDomainSharedModule),
    typeof(AbpOpenIddictDomainSharedModule),
    typeof(BlobStoringDatabaseDomainSharedModule)
    )]
public class kareem_fullstack_portfolioDomainSharedModule : AbpModule
{
    public override void PreConfigureServices(ServiceConfigurationContext context)
    {
        kareem_fullstack_portfolioGlobalFeatureConfigurator.Configure();
        kareem_fullstack_portfolioModuleExtensionConfigurator.Configure();
    }

    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        Configure<AbpVirtualFileSystemOptions>(options =>
        {
            options.FileSets.AddEmbedded<kareem_fullstack_portfolioDomainSharedModule>();
        });

        Configure<AbpLocalizationOptions>(options =>
        {
            options.Resources
                .Add<kareem_fullstack_portfolioResource>("ar")
                .AddBaseTypes(typeof(AbpValidationResource))
                .AddVirtualJson("/Localization/kareem_fullstack_portfolio");

            options.DefaultResourceType = typeof(kareem_fullstack_portfolioResource);
            
            options.Languages.Add(new LanguageInfo("ar", "ar", "Arabic")); 
            options.Languages.Add(new LanguageInfo("en", "en", "English")); 
            options.Languages.Add(new LanguageInfo("fr", "fr", "French")); 
            options.Languages.Add(new LanguageInfo("de-DE", "de-DE", "German (Germany)")); 

        });
        
        Configure<AbpExceptionLocalizationOptions>(options =>
        {
            options.MapCodeNamespace("kareem_fullstack_portfolio", typeof(kareem_fullstack_portfolioResource));
        });
    }
}
