using kareem_fullstack_portfolio.Projects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace kareem_fullstack_portfolio.EntityFrameworkCore.Projects;

public class PortfolioProjectTechnologyConfiguration : IEntityTypeConfiguration<PortfolioProjectTechnology>
{
    public void Configure(EntityTypeBuilder<PortfolioProjectTechnology> builder)
    {
        builder.ToTable(kareem_fullstack_portfolioConsts.DbTablePrefix + "PortfolioProjectTechnologies", kareem_fullstack_portfolioConsts.DbSchema);

        builder.ConfigureByConvention();

        builder.Property(technology => technology.PortfolioProjectId)
            .IsRequired();

        builder.Property(technology => technology.Name)
            .IsRequired()
            .HasMaxLength(PortfolioProjectConsts.MaxTechnologyNameLength);

        builder.Property(technology => technology.DisplayOrder)
            .IsRequired();

        builder.HasIndex(technology => new { technology.PortfolioProjectId, technology.Name })
            .IsUnique();
    }
}
