namespace kareem_fullstack_portfolio.Projects;

public class GetAdminPortfolioProjectListInput
{
    public string? SearchText { get; set; }

    public PortfolioProjectType? ProjectType { get; set; }

    public bool? IsActive { get; set; }

    public bool? IsFeatured { get; set; }
}
