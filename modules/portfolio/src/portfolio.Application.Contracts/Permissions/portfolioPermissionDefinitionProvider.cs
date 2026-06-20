using portfolio.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;

namespace portfolio.Permissions;

public class portfolioPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var myGroup = context.AddGroup(portfolioPermissions.GroupName, L("Permission:portfolio"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<portfolioResource>(name);
    }
}
