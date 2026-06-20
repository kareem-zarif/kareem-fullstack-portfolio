using System.ComponentModel.DataAnnotations;

namespace kareem_fullstack_portfolio.Skills;

public class CreateUpdatePortfolioSkillDto
{
    [Required]
    [StringLength(PortfolioSkillConsts.MaxNameLength)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public PortfolioSkillCategory Category { get; set; }

    public bool IsPrimary { get; set; }

    public bool IsActive { get; set; } = true;

    [Range(0, int.MaxValue)]
    public int DisplayOrder { get; set; }
}
