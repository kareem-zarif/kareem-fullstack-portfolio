using kareem_fullstack_portfolio.Skills;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace kareem_fullstack_portfolio.EntityFrameworkCore.Skills;

public class PortfolioSkillConfiguration : IEntityTypeConfiguration<PortfolioSkill>
{
    public void Configure(EntityTypeBuilder<PortfolioSkill> builder)
    {
        builder.ToTable(kareem_fullstack_portfolioConsts.DbTablePrefix + "PortfolioSkills", kareem_fullstack_portfolioConsts.DbSchema);

        builder.ConfigureByConvention();

        builder.Property(skill => skill.Name)
            .IsRequired()
            .HasMaxLength(PortfolioSkillConsts.MaxNameLength);

        builder.Property(skill => skill.Category)
            .IsRequired();

        builder.Property(skill => skill.IsPrimary)
            .IsRequired();

        builder.Property(skill => skill.IsActive)
            .IsRequired();

        builder.Property(skill => skill.DisplayOrder)
            .IsRequired();

        builder.HasIndex(skill => new { skill.Category, skill.Name, skill.IsDeleted })
            .IsUnique();

        builder.HasIndex(skill => new { skill.IsActive, skill.Category, skill.DisplayOrder });
    }
}
