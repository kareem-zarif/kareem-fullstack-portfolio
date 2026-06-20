using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.Modularity;

namespace portfolio.EntityFrameworkCore;

[DependsOn(
    typeof(portfolioDomainModule),
    typeof(AbpEntityFrameworkCoreModule)
)]
public class portfolioEntityFrameworkCoreModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        context.Services.AddAbpDbContext<portfolioDbContext>(options =>
        {
            options.AddDefaultRepositories<IportfolioDbContext>(includeAllEntities: true);
            
            /* Add custom repositories here. Example:
            * options.AddRepository<Question, EfCoreQuestionRepository>();
            */
        });
    }
}
