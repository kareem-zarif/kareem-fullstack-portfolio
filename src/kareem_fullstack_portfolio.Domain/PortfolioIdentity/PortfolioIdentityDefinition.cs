using System;
using System.Collections.Generic;
using System.Linq;
using Volo.Abp;

namespace kareem_fullstack_portfolio.PortfolioIdentity;

public class PortfolioIdentityDefinition
{
    public string FullName { get; }

    public string ProfessionalTitle { get; }

    public string MainMessage { get; }

    public string BusinessSummary { get; }

    public string VisualDirection { get; }

    public IReadOnlyList<PortfolioTargetAudienceType> TargetAudiences { get; }

    public IReadOnlyList<PortfolioCallToActionDefinition> CallToActions { get; }

    public PortfolioIdentityDefinition(
        string fullName,
        string professionalTitle,
        string mainMessage,
        string businessSummary,
        string visualDirection,
        IReadOnlyList<PortfolioTargetAudienceType> targetAudiences,
        IReadOnlyList<PortfolioCallToActionDefinition> callToActions)
    {
        FullName = fullName;
        ProfessionalTitle = professionalTitle;
        MainMessage = mainMessage;
        BusinessSummary = businessSummary;
        VisualDirection = visualDirection;
        TargetAudiences = targetAudiences;
        CallToActions = callToActions;
    }

    public void EnsureValid()
    {
        if (FullName.IsNullOrWhiteSpace())
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioIdentityFullNameRequired);
        }

        if (ProfessionalTitle.IsNullOrWhiteSpace() ||
            !ProfessionalTitle.Contains(".NET", StringComparison.OrdinalIgnoreCase) ||
            !ProfessionalTitle.Contains("Full Stack", StringComparison.OrdinalIgnoreCase))
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioIdentityTitleMustShowDotNetFullStack);
        }

        if (MainMessage.IsNullOrWhiteSpace() ||
            !MainMessage.Contains("business systems", StringComparison.OrdinalIgnoreCase))
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioIdentityMainMessageMustFocusOnBusinessSystems);
        }

        if (BusinessSummary.IsNullOrWhiteSpace())
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioIdentitySummaryRequired);
        }

        foreach (var requiredCallToAction in Enum.GetValues<PortfolioCallToActionType>())
        {
            if (CallToActions.All(callToAction => callToAction.Type != requiredCallToAction))
            {
                throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioIdentityMissingRequiredCallToAction)
                    .WithData("CallToAction", requiredCallToAction.ToString());
            }
        }
    }
}
