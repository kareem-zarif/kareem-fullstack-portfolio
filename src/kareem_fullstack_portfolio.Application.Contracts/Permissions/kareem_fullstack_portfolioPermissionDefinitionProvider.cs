using kareem_fullstack_portfolio.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;
using Volo.Abp.MultiTenancy;

namespace kareem_fullstack_portfolio.Permissions;

public class kareem_fullstack_portfolioPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var myGroup = context.AddGroup(kareem_fullstack_portfolioPermissions.GroupName);

        //Define your own permissions here. Example:
        //myGroup.AddPermission(kareem_fullstack_portfolioPermissions.MyPermission1, L("Permission:MyPermission1"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<kareem_fullstack_portfolioResource>(name);
    }
}
