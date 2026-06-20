using kareem_fullstack_portfolio.Samples;
using Xunit;

namespace kareem_fullstack_portfolio.EntityFrameworkCore.Domains;

[Collection(kareem_fullstack_portfolioTestConsts.CollectionDefinitionName)]
public class EfCoreSampleDomainTests : SampleDomainTests<kareem_fullstack_portfolioEntityFrameworkCoreTestModule>
{

}
