using System;
using Volo.Abp;
using Volo.Abp.Domain.Entities.Auditing;

namespace kareem_fullstack_portfolio.Skills;

public class PortfolioSkill : FullAuditedAggregateRoot<Guid>
{
    public string Name { get; private set; } = string.Empty;

    public PortfolioSkillCategory Category { get; private set; }

    public bool IsPrimary { get; private set; }

    public bool IsActive { get; private set; }

    public int DisplayOrder { get; private set; }

    protected PortfolioSkill()
    {
    }

    public PortfolioSkill(
        Guid id,
        string name,
        PortfolioSkillCategory category,
        bool isPrimary,
        bool isActive,
        int displayOrder)
        : base(id)
    {
        SetName(name);
        SetCategory(category);
        SetDisplayOrder(displayOrder);

        IsPrimary = isPrimary;
        IsActive = isActive;
    }

    public void Update(
        string name,
        PortfolioSkillCategory category,
        bool isPrimary,
        bool isActive,
        int displayOrder)
    {
        SetName(name);
        SetCategory(category);
        SetDisplayOrder(displayOrder);

        IsPrimary = isPrimary;
        IsActive = isActive;
    }

    private void SetName(string name)
    {
        if (name.IsNullOrWhiteSpace())
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioSkillNameRequired);
        }

        var normalizedName = name.Trim();

        if (normalizedName.Length > PortfolioSkillConsts.MaxNameLength)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioSkillNameTooLong)
                .WithData("MaxLength", PortfolioSkillConsts.MaxNameLength);
        }

        Name = normalizedName;
    }

    private void SetCategory(PortfolioSkillCategory category)
    {
        Category = category;
    }

    private void SetDisplayOrder(int displayOrder)
    {
        if (displayOrder < 0)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioSkillDisplayOrderMustBeZeroOrPositive);
        }

        DisplayOrder = displayOrder;
    }
}
