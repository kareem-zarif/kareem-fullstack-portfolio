using System;
using Volo.Abp;
using Volo.Abp.Domain.Entities;

namespace kareem_fullstack_portfolio.Experience;

public class PortfolioExperienceHighlight : Entity<Guid>
{
    public Guid PortfolioExperienceId { get; private set; }

    public string Text { get; private set; } = string.Empty;

    public int DisplayOrder { get; private set; }

    protected PortfolioExperienceHighlight()
    {
    }

    internal PortfolioExperienceHighlight(Guid id, Guid portfolioExperienceId, string text, int displayOrder)
        : base(id)
    {
        PortfolioExperienceId = portfolioExperienceId;
        SetText(text);
        SetDisplayOrder(displayOrder);
    }

    public override object[] GetKeys()
    {
        return [Id];
    }

    private void SetText(string text)
    {
        if (text.IsNullOrWhiteSpace())
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceHighlightRequired);
        }

        var normalizedText = text.Trim();

        if (normalizedText.Length > PortfolioExperienceConsts.MaxHighlightLength)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceHighlightTooLong)
                .WithData("MaxLength", PortfolioExperienceConsts.MaxHighlightLength);
        }

        Text = normalizedText;
    }

    private void SetDisplayOrder(int displayOrder)
    {
        if (displayOrder < 0)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioExperienceDisplayOrderMustBeZeroOrPositive);
        }

        DisplayOrder = displayOrder;
    }
}
