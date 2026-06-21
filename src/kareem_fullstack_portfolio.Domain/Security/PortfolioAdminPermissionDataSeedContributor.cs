using System.Threading.Tasks;
using kareem_fullstack_portfolio.AppShell;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.PermissionManagement;

namespace kareem_fullstack_portfolio.Security;

public class PortfolioAdminPermissionDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private const string AdminRoleName = "admin";
    private const string RolePermissionProviderName = "R";

    private static readonly string[] AdminPermissionNames =
    [
        PortfolioAppShellAuthorizationNames.AdminAccess,
        PortfolioAppShellAuthorizationNames.Dashboard,
        PortfolioAppShellAuthorizationNames.Projects,
        PortfolioAppShellAuthorizationNames.Projects + ".Manage",
        PortfolioAppShellAuthorizationNames.Skills,
        PortfolioAppShellAuthorizationNames.Skills + ".Manage",
        PortfolioAppShellAuthorizationNames.Experience,
        PortfolioAppShellAuthorizationNames.Experience + ".Manage",
        PortfolioAppShellAuthorizationNames.Messages,
        PortfolioAppShellAuthorizationNames.Messages + ".Manage"
    ];

    private readonly IPermissionDataSeeder _permissionDataSeeder;

    public PortfolioAdminPermissionDataSeedContributor(IPermissionDataSeeder permissionDataSeeder)
    {
        _permissionDataSeeder = permissionDataSeeder;
    }

    public async Task SeedAsync(DataSeedContext context)
    {
        await _permissionDataSeeder.SeedAsync(
            RolePermissionProviderName,
            AdminRoleName,
            AdminPermissionNames,
            context.TenantId);
    }
}
