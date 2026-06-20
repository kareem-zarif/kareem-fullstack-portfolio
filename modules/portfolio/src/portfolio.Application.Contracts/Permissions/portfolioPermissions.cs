using Volo.Abp.Reflection;

namespace portfolio.Permissions;

public class portfolioPermissions
{
    public const string GroupName = "portfolio";

    public static string[] GetAll()
    {
        return ReflectionHelper.GetPublicConstantsRecursively(typeof(portfolioPermissions));
    }
}
