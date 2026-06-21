using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using kareem_fullstack_portfolio.AppShell;
using kareem_fullstack_portfolio.Experience;
using kareem_fullstack_portfolio.PortfolioIdentity;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Uow;
using Volo.Abp;

namespace kareem_fullstack_portfolio.SiteSettings;

public class PortfolioSiteSettingDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IRepository<PortfolioSiteSetting, Guid> _portfolioSiteSettingRepository;
    private readonly IPortfolioIdentityDefinitionProvider _identityDefinitionProvider;
    private readonly IPortfolioAppShellDefinitionProvider _appShellDefinitionProvider;
    private readonly IPortfolioExperienceSectionDefinitionProvider _experienceSectionDefinitionProvider;

    public PortfolioSiteSettingDataSeedContributor(
        IRepository<PortfolioSiteSetting, Guid> portfolioSiteSettingRepository,
        IPortfolioIdentityDefinitionProvider identityDefinitionProvider,
        IPortfolioAppShellDefinitionProvider appShellDefinitionProvider,
        IPortfolioExperienceSectionDefinitionProvider experienceSectionDefinitionProvider)
    {
        _portfolioSiteSettingRepository = portfolioSiteSettingRepository;
        _identityDefinitionProvider = identityDefinitionProvider;
        _appShellDefinitionProvider = appShellDefinitionProvider;
        _experienceSectionDefinitionProvider = experienceSectionDefinitionProvider;
    }

    [UnitOfWork]
    public async Task SeedAsync(DataSeedContext context)
    {
        if (await _portfolioSiteSettingRepository.GetCountAsync() > 0)
        {
            return;
        }

        foreach (var seed in GetSeeds())
        {
            var setting = new PortfolioSiteSetting(
                seed.Id,
                seed.Key,
                seed.Value,
                seed.ValueType,
                seed.IsPublic,
                isActive: true,
                seed.DisplayOrder);

            await _portfolioSiteSettingRepository.InsertAsync(setting, autoSave: true);
        }
    }

    private IReadOnlyList<PortfolioSiteSettingSeedItem> GetSeeds()
    {
        var identity = _identityDefinitionProvider.Get();
        var appShell = _appShellDefinitionProvider.Get();
        var experienceSection = _experienceSectionDefinitionProvider.Get();
        var footerLinks = appShell.FooterLinks
            .Where(link => !link.Url.IsNullOrWhiteSpace())
            .Select(link => new
            {
                link.Type,
                link.Url,
                link.IsExternal,
                link.DisplayOrder
            })
            .ToList();

        return
        [
            new(new Guid("93B45C4D-7FD0-4C7D-93EE-1F5D76B64001"), "identity.full-name", identity.FullName, PortfolioSiteSettingValueType.Text, true, 1),
            new(new Guid("93B45C4D-7FD0-4C7D-93EE-1F5D76B64002"), "identity.professional-title", identity.ProfessionalTitle, PortfolioSiteSettingValueType.Text, true, 2),
            new(new Guid("93B45C4D-7FD0-4C7D-93EE-1F5D76B64003"), "identity.main-message", identity.MainMessage, PortfolioSiteSettingValueType.Text, true, 3),
            new(new Guid("93B45C4D-7FD0-4C7D-93EE-1F5D76B64004"), "identity.business-summary", identity.BusinessSummary, PortfolioSiteSettingValueType.Text, true, 4),
            new(new Guid("93B45C4D-7FD0-4C7D-93EE-1F5D76B64005"), "identity.visual-direction", identity.VisualDirection, PortfolioSiteSettingValueType.Text, true, 5),
            new(
                new Guid("93B45C4D-7FD0-4C7D-93EE-1F5D76B64006"),
                "identity.target-audiences",
                JsonSerializer.Serialize(identity.TargetAudiences.Select(audience => audience.ToString())),
                PortfolioSiteSettingValueType.Json,
                true,
                6),
            new(
                new Guid("93B45C4D-7FD0-4C7D-93EE-1F5D76B64007"),
                "identity.call-to-actions",
                JsonSerializer.Serialize(identity.CallToActions.Select(action => new
                {
                    action.Type,
                    action.Url,
                    action.IsExternal,
                    action.DisplayOrder,
                    action.Style
                })),
                PortfolioSiteSettingValueType.Json,
                true,
                7),
            new(new Guid("93B45C4D-7FD0-4C7D-93EE-1F5D76B64008"), "app-shell.brand-name", appShell.BrandName, PortfolioSiteSettingValueType.Text, true, 8),
            new(new Guid("93B45C4D-7FD0-4C7D-93EE-1F5D76B64009"), "experience.headline", experienceSection.Headline, PortfolioSiteSettingValueType.Text, true, 9),
            new(new Guid("93B45C4D-7FD0-4C7D-93EE-1F5D76B64010"), "experience.summary", experienceSection.Summary, PortfolioSiteSettingValueType.Text, true, 10),
            new(
                new Guid("93B45C4D-7FD0-4C7D-93EE-1F5D76B64011"),
                "app-shell.footer-links",
                JsonSerializer.Serialize(footerLinks),
                PortfolioSiteSettingValueType.Json,
                true,
                11)
        ];
    }

    private sealed record PortfolioSiteSettingSeedItem(
        Guid Id,
        string Key,
        string Value,
        PortfolioSiteSettingValueType ValueType,
        bool IsPublic,
        int DisplayOrder);
}
