using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace kareem_fullstack_portfolio.PortfolioIdentity;

[AllowAnonymous]
public class PortfolioIdentityAppService : kareem_fullstack_portfolioAppService, IPortfolioIdentityAppService
{
    private readonly IPortfolioIdentityDefinitionProvider _identityDefinitionProvider;

    public PortfolioIdentityAppService(IPortfolioIdentityDefinitionProvider identityDefinitionProvider)
    {
        _identityDefinitionProvider = identityDefinitionProvider;
    }

    public Task<PortfolioIdentityDto> GetAsync()
    {
        var identity = _identityDefinitionProvider.Get();

        return Task.FromResult(new PortfolioIdentityDto
        {
            FullName = identity.FullName,
            ProfessionalTitle = identity.ProfessionalTitle,
            MainMessage = identity.MainMessage,
            BusinessSummary = identity.BusinessSummary,
            VisualDirection = identity.VisualDirection,
            TargetAudiences = identity.TargetAudiences
                .Select(audience => new PortfolioTargetAudienceDto
                {
                    Type = audience,
                    Label = L[$"Enum:PortfolioTargetAudienceType.{audience}"]
                })
                .ToList(),
            CallToActions = identity.CallToActions
                .OrderBy(callToAction => callToAction.DisplayOrder)
                .Select(callToAction => new PortfolioCallToActionDto
                {
                    Type = callToAction.Type,
                    Label = L[$"Enum:PortfolioCallToActionType.{callToAction.Type}"],
                    Url = callToAction.Url,
                    IsExternal = callToAction.IsExternal,
                    DisplayOrder = callToAction.DisplayOrder,
                    Style = callToAction.Style
                })
                .ToList()
        });
    }
}
