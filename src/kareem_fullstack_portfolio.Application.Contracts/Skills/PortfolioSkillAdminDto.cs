using System;

namespace kareem_fullstack_portfolio.Skills;

public class PortfolioSkillAdminDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public PortfolioSkillCategory Category { get; set; }

    public string CategoryLabel { get; set; } = string.Empty;

    public bool IsPrimary { get; set; }

    public bool IsActive { get; set; }

    public int DisplayOrder { get; set; }
}
