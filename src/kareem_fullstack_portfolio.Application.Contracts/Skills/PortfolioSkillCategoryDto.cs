using System.Collections.Generic;

namespace kareem_fullstack_portfolio.Skills;

public class PortfolioSkillCategoryDto
{
    public PortfolioSkillCategory Category { get; set; }

    public string CategoryLabel { get; set; } = string.Empty;

    public List<PortfolioSkillDto> Skills { get; set; } = [];
}
