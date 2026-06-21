using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Domain.Repositories;

namespace kareem_fullstack_portfolio.SiteSettings;

[AllowAnonymous]
[Route("api/site-settings")]
public class PublicPortfolioSiteSettingAppService : kareem_fullstack_portfolioAppService, IPublicPortfolioSiteSettingAppService
{
    private readonly IRepository<PortfolioSiteSetting, Guid> _portfolioSiteSettingRepository;

    public PublicPortfolioSiteSettingAppService(IRepository<PortfolioSiteSetting, Guid> portfolioSiteSettingRepository)
    {
        _portfolioSiteSettingRepository = portfolioSiteSettingRepository;
    }

    [HttpGet]
    public async Task<IReadOnlyList<PublicPortfolioSiteSettingDto>> GetListAsync()
    {
        var queryable = await _portfolioSiteSettingRepository.GetQueryableAsync();
        var settings = await AsyncExecuter.ToListAsync(
            queryable
                .Where(setting => setting.IsPublic && setting.IsActive)
                .OrderBy(setting => setting.DisplayOrder)
                .ThenBy(setting => setting.Key));

        return settings
            .Select(setting => new PublicPortfolioSiteSettingDto
            {
                Key = setting.Key,
                Value = setting.Value,
                ValueType = setting.ValueType,
                ValueTypeLabel = L[$"Enum:PortfolioSiteSettingValueType.{setting.ValueType}"],
                DisplayOrder = setting.DisplayOrder
            })
            .ToList();
    }
}
