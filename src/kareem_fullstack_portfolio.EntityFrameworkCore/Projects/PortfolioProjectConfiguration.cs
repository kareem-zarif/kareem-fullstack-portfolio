using kareem_fullstack_portfolio.Projects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace kareem_fullstack_portfolio.EntityFrameworkCore.Projects;

public class PortfolioProjectConfiguration : IEntityTypeConfiguration<PortfolioProject>
{
    public void Configure(EntityTypeBuilder<PortfolioProject> builder)
    {
        builder.ToTable(kareem_fullstack_portfolioConsts.DbTablePrefix + "PortfolioProjects", kareem_fullstack_portfolioConsts.DbSchema);

        builder.ConfigureByConvention();

        builder.Property(project => project.Title)
            .IsRequired()
            .HasMaxLength(PortfolioProjectConsts.MaxTitleLength);

        builder.Property(project => project.Slug)
            .IsRequired()
            .HasMaxLength(PortfolioProjectConsts.MaxSlugLength);

        builder.Property(project => project.ProjectType)
            .IsRequired();

        builder.Property(project => project.ShortSummary)
            .IsRequired()
            .HasMaxLength(PortfolioProjectConsts.MaxShortSummaryLength);

        builder.Property(project => project.BusinessValue)
            .IsRequired()
            .HasMaxLength(PortfolioProjectConsts.MaxBusinessValueLength);

        builder.Property(project => project.IsFeatured)
            .IsRequired();

        builder.Property(project => project.IsActive)
            .IsRequired();

        builder.Property(project => project.GitHubUrl)
            .HasMaxLength(PortfolioProjectConsts.MaxUrlLength);

        builder.Property(project => project.GitHubFrontendUrl)
            .HasMaxLength(PortfolioProjectConsts.MaxUrlLength);

        builder.Property(project => project.LiveDemoUrl)
            .HasMaxLength(PortfolioProjectConsts.MaxUrlLength);

        builder.Property(project => project.DisplayOrder)
            .IsRequired();

        builder.HasMany(project => project.TechStack)
            .WithOne()
            .HasForeignKey(technology => technology.PortfolioProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(project => new { project.Slug, project.IsDeleted })
            .IsUnique();

        builder.HasIndex(project => new { project.IsActive, project.IsFeatured, project.DisplayOrder });
    }
}
