using Volo.Abp.GlobalFeatures;
using Volo.Abp.Threading;

namespace kareem_fullstack_portfolio;

public static class kareem_fullstack_portfolioGlobalFeatureConfigurator
{
    private static readonly OneTimeRunner OneTimeRunner = new OneTimeRunner();

    public static void Configure()
    {
        OneTimeRunner.Run(() =>
        {
                /* You can configure (enable/disable) global features of the used modules here.
                 * Please refer to the documentation to learn more about the Global Features System:
                 * https://docs.abp.io/en/abp/latest/Global-Features
                 */
            });
    }
}
