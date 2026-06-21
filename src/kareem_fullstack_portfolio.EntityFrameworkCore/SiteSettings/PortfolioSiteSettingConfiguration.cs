using kareem_fullstack_portfolio.SiteSettings;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace kareem_fullstack_portfolio.EntityFrameworkCore.SiteSettings;

public class PortfolioSiteSettingConfiguration : IEntityTypeConfiguration<PortfolioSiteSetting>
{
    public void Configure(EntityTypeBuilder<PortfolioSiteSetting> builder)
    {
        builder.ToTable(kareem_fullstack_portfolioConsts.DbTablePrefix + "PortfolioSiteSettings", kareem_fullstack_portfolioConsts.DbSchema);

        builder.ConfigureByConvention();

        builder.Property(setting => setting.Key)
            .IsRequired()
            .HasMaxLength(PortfolioSiteSettingConsts.MaxKeyLength);

        builder.Property(setting => setting.Value)
            .IsRequired()
            .HasMaxLength(PortfolioSiteSettingConsts.MaxValueLength);

        builder.Property(setting => setting.ValueType)
            .IsRequired();

        builder.Property(setting => setting.IsPublic)
            .IsRequired();

        builder.Property(setting => setting.IsActive)
            .IsRequired();

        builder.Property(setting => setting.DisplayOrder)
            .IsRequired();

        builder.HasIndex(setting => new { setting.Key, setting.IsDeleted })
            .IsUnique();

        builder.HasIndex(setting => new { setting.IsPublic, setting.IsActive, setting.DisplayOrder });
    }
}
