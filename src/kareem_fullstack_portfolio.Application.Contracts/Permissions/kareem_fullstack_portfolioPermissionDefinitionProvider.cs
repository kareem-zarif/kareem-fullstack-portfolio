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

        var adminAccess = myGroup.AddPermission(
            kareem_fullstack_portfolioPermissions.Admin.Access,
            L("Permission:Admin.Access"));

        var skillsPermission = adminAccess.AddChild(
            kareem_fullstack_portfolioPermissions.Skills.Default,
            L("Permission:Skills"));

        skillsPermission.AddChild(
            kareem_fullstack_portfolioPermissions.Skills.Manage,
            L("Permission:Skills.Manage"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<kareem_fullstack_portfolioResource>(name);
    }
}
