using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using kareem_fullstack_portfolio.Data;
using Volo.Abp.DependencyInjection;

namespace kareem_fullstack_portfolio.EntityFrameworkCore;

public class EntityFrameworkCorekareem_fullstack_portfolioDbSchemaMigrator
    : Ikareem_fullstack_portfolioDbSchemaMigrator, ITransientDependency
{
    private readonly IServiceProvider _serviceProvider;

    public EntityFrameworkCorekareem_fullstack_portfolioDbSchemaMigrator(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task MigrateAsync()
    {
        /* We intentionally resolving the kareem_fullstack_portfolioDbContext
         * from IServiceProvider (instead of directly injecting it)
         * to properly get the connection string of the current tenant in the
         * current scope.
         */

        await _serviceProvider
            .GetRequiredService<kareem_fullstack_portfolioDbContext>()
            .Database
            .MigrateAsync();
    }
}
