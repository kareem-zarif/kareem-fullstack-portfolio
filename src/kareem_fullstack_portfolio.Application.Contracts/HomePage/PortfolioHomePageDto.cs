using System.Collections.Generic;
using kareem_fullstack_portfolio.PortfolioIdentity;

namespace kareem_fullstack_portfolio.HomePage;

public class PortfolioHomePageDto
{
    public PortfolioIdentityDto Identity { get; set; } = new();

    public List<PortfolioHomeProfessionalLinkDto> ProfessionalLinks { get; set; } = [];

    public List<PortfolioHomeTechStackCardDto> TechStackCards { get; set; } = [];

    public List<PortfolioHomeFeaturedProjectDto> FeaturedProjects { get; set; } = [];

    public PortfolioHomeErpExperienceHighlightDto ErpExperienceHighlight { get; set; } = new();

    public List<PortfolioHomeBusinessValueDto> BusinessValueItems { get; set; } = [];

    public PortfolioHomeContactCallToActionDto ContactCallToAction { get; set; } = new();
}
