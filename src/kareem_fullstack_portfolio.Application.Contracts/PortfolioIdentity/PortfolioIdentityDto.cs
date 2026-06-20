using System.Collections.Generic;

namespace kareem_fullstack_portfolio.PortfolioIdentity;

public class PortfolioIdentityDto
{
    public string FullName { get; set; } = string.Empty;

    public string ProfessionalTitle { get; set; } = string.Empty;

    public string MainMessage { get; set; } = string.Empty;

    public string BusinessSummary { get; set; } = string.Empty;

    public string VisualDirection { get; set; } = string.Empty;

    public List<PortfolioTargetAudienceDto> TargetAudiences { get; set; } = [];

    public List<PortfolioCallToActionDto> CallToActions { get; set; } = [];
}
