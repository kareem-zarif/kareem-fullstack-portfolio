using System;

namespace kareem_fullstack_portfolio.Skills;

public class PortfolioSkillDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public bool IsPrimary { get; set; }

    public int DisplayOrder { get; set; }
}
