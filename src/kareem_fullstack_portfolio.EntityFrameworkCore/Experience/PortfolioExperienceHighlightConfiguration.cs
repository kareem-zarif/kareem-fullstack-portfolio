using kareem_fullstack_portfolio.Experience;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace kareem_fullstack_portfolio.EntityFrameworkCore.Experience;

public class PortfolioExperienceHighlightConfiguration : IEntityTypeConfiguration<PortfolioExperienceHighlight>
{
    public void Configure(EntityTypeBuilder<PortfolioExperienceHighlight> builder)
    {
        builder.ToTable(kareem_fullstack_portfolioConsts.DbTablePrefix + "PortfolioExperienceHighlights", kareem_fullstack_portfolioConsts.DbSchema);

        builder.ConfigureByConvention();

        builder.Property(highlight => highlight.PortfolioExperienceId)
            .IsRequired();

        builder.Property(highlight => highlight.Text)
            .IsRequired()
            .HasMaxLength(PortfolioExperienceConsts.MaxHighlightLength);

        builder.Property(highlight => highlight.DisplayOrder)
            .IsRequired();

        builder.HasIndex(highlight => new { highlight.PortfolioExperienceId, highlight.Text })
            .IsUnique();
    }
}
