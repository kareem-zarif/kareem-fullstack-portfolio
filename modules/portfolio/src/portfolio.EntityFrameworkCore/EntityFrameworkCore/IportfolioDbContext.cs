using Volo.Abp.Data;
using Volo.Abp.EntityFrameworkCore;

namespace portfolio.EntityFrameworkCore;

[ConnectionStringName(portfolioDbProperties.ConnectionStringName)]
public interface IportfolioDbContext : IEfCoreDbContext
{
    /* Add DbSet for each Aggregate Root here. Example:
     * DbSet<Question> Questions { get; }
     */
}
