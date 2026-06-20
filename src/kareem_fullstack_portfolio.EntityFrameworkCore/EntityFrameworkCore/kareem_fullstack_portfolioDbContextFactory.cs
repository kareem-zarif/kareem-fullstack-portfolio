using System;
using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace kareem_fullstack_portfolio.EntityFrameworkCore;

/* This class is needed for EF Core console commands
 * (like Add-Migration and Update-Database commands) */
public class kareem_fullstack_portfolioDbContextFactory : IDesignTimeDbContextFactory<kareem_fullstack_portfolioDbContext>
{
    public kareem_fullstack_portfolioDbContext CreateDbContext(string[] args)
    {
        var configuration = BuildConfiguration();
        
        kareem_fullstack_portfolioEfCoreEntityExtensionMappings.Configure();

        var builder = new DbContextOptionsBuilder<kareem_fullstack_portfolioDbContext>()
            .UseSqlServer(configuration.GetConnectionString("Default"));
        
        return new kareem_fullstack_portfolioDbContext(builder.Options);
    }

    private static IConfigurationRoot BuildConfiguration()
    {
        var builder = new ConfigurationBuilder()
            .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "../kareem_fullstack_portfolio.DbMigrator/"))
            .AddJsonFile("appsettings.json", optional: false)
            .AddEnvironmentVariables();

        return builder.Build();
    }
}
