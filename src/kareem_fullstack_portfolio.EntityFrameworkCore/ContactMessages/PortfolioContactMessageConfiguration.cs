using kareem_fullstack_portfolio.ContactMessages;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace kareem_fullstack_portfolio.EntityFrameworkCore.ContactMessages;

public class PortfolioContactMessageConfiguration : IEntityTypeConfiguration<PortfolioContactMessage>
{
    public void Configure(EntityTypeBuilder<PortfolioContactMessage> builder)
    {
        builder.ToTable(kareem_fullstack_portfolioConsts.DbTablePrefix + "PortfolioContactMessages", kareem_fullstack_portfolioConsts.DbSchema);

        builder.ConfigureByConvention();

        builder.Property(message => message.Name)
            .IsRequired()
            .HasMaxLength(PortfolioContactMessageConsts.MaxNameLength);

        builder.Property(message => message.Email)
            .IsRequired()
            .HasMaxLength(PortfolioContactMessageConsts.MaxEmailLength);

        builder.Property(message => message.Company)
            .HasMaxLength(PortfolioContactMessageConsts.MaxCompanyLength);

        builder.Property(message => message.Subject)
            .IsRequired()
            .HasMaxLength(PortfolioContactMessageConsts.MaxSubjectLength);

        builder.Property(message => message.Message)
            .IsRequired()
            .HasMaxLength(PortfolioContactMessageConsts.MaxMessageLength);

        builder.Property(message => message.IsRead)
            .IsRequired();

        builder.Property(message => message.IsArchived)
            .IsRequired();

        builder.HasIndex(message => new { message.IsArchived, message.IsRead, message.CreationTime });
        builder.HasIndex(message => message.Email);
    }
}
