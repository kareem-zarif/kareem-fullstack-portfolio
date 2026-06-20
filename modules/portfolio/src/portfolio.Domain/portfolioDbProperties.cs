namespace portfolio;

public static class portfolioDbProperties
{
    public static string DbTablePrefix { get; set; } = "portfolio";

    public static string? DbSchema { get; set; } = null;

    public const string ConnectionStringName = "portfolio";
}
