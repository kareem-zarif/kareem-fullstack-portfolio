using kareem_fullstack_portfolio.Experience;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace kareem_fullstack_portfolio.EntityFrameworkCore.Experience;

public class PortfolioExperienceConfiguration : IEntityTypeConfiguration<PortfolioExperience>
{
    public void Configure(EntityTypeBuilder<PortfolioExperience> builder)
    {
        builder.ToTable(kareem_fullstack_portfolioConsts.DbTablePrefix + "PortfolioExperiences", kareem_fullstack_portfolioConsts.DbSchema);

        builder.ConfigureByConvention();

        builder.Property(experience => experience.Type)
            .IsRequired();

        builder.Property(experience => experience.StageLabel)
            .IsRequired()
            .HasMaxLength(PortfolioExperienceConsts.MaxStageLabelLength);

        builder.Property(experience => experience.Title)
            .IsRequired()
            .HasMaxLength(PortfolioExperienceConsts.MaxTitleLength);

        builder.Property(experience => experience.Organization)
            .IsRequired()
            .HasMaxLength(PortfolioExperienceConsts.MaxOrganizationLength);

        builder.Property(experience => experience.Summary)
            .IsRequired()
            .HasMaxLength(PortfolioExperienceConsts.MaxSummaryLength);

        builder.Property(experience => experience.BusinessValue)
            .IsRequired()
            .HasMaxLength(PortfolioExperienceConsts.MaxBusinessValueLength);

        builder.Property(experience => experience.IsPrimaryProfessionalExperience)
            .IsRequired();

        builder.Property(experience => experience.IsActive)
            .IsRequired();

        builder.Property(experience => experience.DisplayOrder)
            .IsRequired();

        builder.HasMany(experience => experience.Highlights)
            .WithOne()
            .HasForeignKey(highlight => highlight.PortfolioExperienceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(experience => new { experience.Type, experience.IsDeleted })
            .IsUnique();

        builder.HasIndex(experience => new { experience.IsActive, experience.DisplayOrder });
    }
}
