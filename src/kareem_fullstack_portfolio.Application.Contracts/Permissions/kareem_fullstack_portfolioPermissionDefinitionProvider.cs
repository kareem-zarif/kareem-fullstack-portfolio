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

        adminAccess.AddChild(
            kareem_fullstack_portfolioPermissions.Dashboard.Default,
            L("Permission:Dashboard"));

        var projectsPermission = adminAccess.AddChild(
            kareem_fullstack_portfolioPermissions.Projects.Default,
            L("Permission:Projects"));

        projectsPermission.AddChild(
            kareem_fullstack_portfolioPermissions.Projects.Manage,
            L("Permission:Projects.Manage"));

        var skillsPermission = adminAccess.AddChild(
            kareem_fullstack_portfolioPermissions.Skills.Default,
            L("Permission:Skills"));

        skillsPermission.AddChild(
            kareem_fullstack_portfolioPermissions.Skills.Manage,
            L("Permission:Skills.Manage"));

        var experiencePermission = adminAccess.AddChild(
            kareem_fullstack_portfolioPermissions.Experience.Default,
            L("Permission:Experience"));

        experiencePermission.AddChild(
            kareem_fullstack_portfolioPermissions.Experience.Manage,
            L("Permission:Experience.Manage"));

        var messagesPermission = adminAccess.AddChild(
            kareem_fullstack_portfolioPermissions.Messages.Default,
            L("Permission:Messages"));

        messagesPermission.AddChild(
            kareem_fullstack_portfolioPermissions.Messages.Manage,
            L("Permission:Messages.Manage"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<kareem_fullstack_portfolioResource>(name);
    }
}
