using Volo.Abp.Modularity;
using Volo.Abp.VirtualFileSystem;

namespace portfolio;

[DependsOn(
    typeof(AbpVirtualFileSystemModule)
    )]
public class portfolioInstallerModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        Configure<AbpVirtualFileSystemOptions>(options =>
        {
            options.FileSets.AddEmbedded<portfolioInstallerModule>();
        });
    }
}
