using Microsoft.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.EntityFrameworkCore;

namespace portfolio.EntityFrameworkCore;

[ConnectionStringName(portfolioDbProperties.ConnectionStringName)]
public class portfolioDbContext : AbpDbContext<portfolioDbContext>, IportfolioDbContext
{
    /* Add DbSet for each Aggregate Root here. Example:
     * public DbSet<Question> Questions { get; set; }
     */

    public portfolioDbContext(DbContextOptions<portfolioDbContext> options)
        : base(options)
    {

    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Configureportfolio();
    }
}
