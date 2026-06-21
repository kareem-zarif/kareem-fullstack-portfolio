using System;
using Volo.Abp;
using Volo.Abp.Domain.Entities;

namespace kareem_fullstack_portfolio.Projects;

public class PortfolioProjectTechnology : Entity<Guid>
{
    public Guid PortfolioProjectId { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public int DisplayOrder { get; private set; }

    protected PortfolioProjectTechnology()
    {
    }

    internal PortfolioProjectTechnology(Guid id, Guid portfolioProjectId, string name, int displayOrder)
        : base(id)
    {
        PortfolioProjectId = portfolioProjectId;
        SetName(name);
        SetDisplayOrder(displayOrder);
    }

    public override object[] GetKeys()
    {
        return [Id];
    }

    private void SetName(string name)
    {
        if (name.IsNullOrWhiteSpace())
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectTechnologyNameRequired);
        }

        var normalizedName = name.Trim();

        if (normalizedName.Length > PortfolioProjectConsts.MaxTechnologyNameLength)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectTechnologyNameTooLong)
                .WithData("MaxLength", PortfolioProjectConsts.MaxTechnologyNameLength);
        }

        Name = normalizedName;
    }

    private void SetDisplayOrder(int displayOrder)
    {
        if (displayOrder < 0)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectDisplayOrderMustBeZeroOrPositive);
        }

        DisplayOrder = displayOrder;
    }
}
