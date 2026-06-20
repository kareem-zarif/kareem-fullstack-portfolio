using Volo.Abp.Modularity;

namespace kareem_fullstack_portfolio;

/* Inherit from this class for your domain layer tests. */
public abstract class kareem_fullstack_portfolioDomainTestBase<TStartupModule> : kareem_fullstack_portfolioTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
