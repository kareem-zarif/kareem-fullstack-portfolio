using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using kareem_fullstack_portfolio.AppShell;
using kareem_fullstack_portfolio.ContactMessages;
using kareem_fullstack_portfolio.Permissions;
using kareem_fullstack_portfolio.Projects;
using kareem_fullstack_portfolio.Skills;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Domain.Repositories;

namespace kareem_fullstack_portfolio.Dashboard;

[Authorize(kareem_fullstack_portfolioPermissions.Admin.Access)]
[Route("api/admin/dashboard")]
public class AdminDashboardAppService : kareem_fullstack_portfolioAppService, IAdminDashboardAppService
{
    private readonly IRepository<PortfolioProject, Guid> _portfolioProjectRepository;
    private readonly IRepository<PortfolioSkill, Guid> _portfolioSkillRepository;
    private readonly IRepository<PortfolioContactMessage, Guid> _portfolioContactMessageRepository;
    private readonly IPermissionChecker _permissionChecker;
    private readonly IPortfolioAppShellDefinitionProvider _portfolioAppShellDefinitionProvider;

    public AdminDashboardAppService(
        IRepository<PortfolioProject, Guid> portfolioProjectRepository,
        IRepository<PortfolioSkill, Guid> portfolioSkillRepository,
        IRepository<PortfolioContactMessage, Guid> portfolioContactMessageRepository,
        IPermissionChecker permissionChecker,
        IPortfolioAppShellDefinitionProvider portfolioAppShellDefinitionProvider)
    {
        _portfolioProjectRepository = portfolioProjectRepository;
        _portfolioSkillRepository = portfolioSkillRepository;
        _portfolioContactMessageRepository = portfolioContactMessageRepository;
        _permissionChecker = permissionChecker;
        _portfolioAppShellDefinitionProvider = portfolioAppShellDefinitionProvider;
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Dashboard.Default)]
    [HttpGet("overview")]
    public async Task<AdminDashboardOverviewDto> GetOverviewAsync()
    {
        var canViewProjects = await _permissionChecker.IsGrantedAsync(kareem_fullstack_portfolioPermissions.Projects.Default);
        var canViewSkills = await _permissionChecker.IsGrantedAsync(kareem_fullstack_portfolioPermissions.Skills.Default);
        var canViewMessages = await _permissionChecker.IsGrantedAsync(kareem_fullstack_portfolioPermissions.Messages.Default);

        var metrics = new List<AdminDashboardMetricDto>();

        if (canViewProjects)
        {
            metrics.Add(new AdminDashboardMetricDto
            {
                Type = PortfolioAdminDashboardMetricType.TotalProjects,
                Label = L[$"Enum:PortfolioAdminDashboardMetricType.{PortfolioAdminDashboardMetricType.TotalProjects}"],
                Value = await GetProjectsCountAsync(),
                RequiredPermissionName = kareem_fullstack_portfolioPermissions.Projects.Default,
                DisplayOrder = 1
            });
        }

        if (canViewSkills)
        {
            metrics.Add(new AdminDashboardMetricDto
            {
                Type = PortfolioAdminDashboardMetricType.TotalSkills,
                Label = L[$"Enum:PortfolioAdminDashboardMetricType.{PortfolioAdminDashboardMetricType.TotalSkills}"],
                Value = await GetSkillsCountAsync(),
                RequiredPermissionName = kareem_fullstack_portfolioPermissions.Skills.Default,
                DisplayOrder = 2
            });
        }

        if (canViewMessages)
        {
            metrics.Add(new AdminDashboardMetricDto
            {
                Type = PortfolioAdminDashboardMetricType.TotalContactMessages,
                Label = L[$"Enum:PortfolioAdminDashboardMetricType.{PortfolioAdminDashboardMetricType.TotalContactMessages}"],
                Value = await GetContactMessagesCountAsync(),
                RequiredPermissionName = kareem_fullstack_portfolioPermissions.Messages.Default,
                DisplayOrder = 3
            });

            metrics.Add(new AdminDashboardMetricDto
            {
                Type = PortfolioAdminDashboardMetricType.UnreadMessages,
                Label = L[$"Enum:PortfolioAdminDashboardMetricType.{PortfolioAdminDashboardMetricType.UnreadMessages}"],
                Value = await GetUnreadMessagesCountAsync(),
                RequiredPermissionName = kareem_fullstack_portfolioPermissions.Messages.Default,
                DisplayOrder = 4
            });
        }

        var recentMessages = canViewMessages
            ? await GetRecentMessagesAsync()
            : [];

        return new AdminDashboardOverviewDto
        {
            GeneratedAtUtc = DateTime.UtcNow,
            HasRecentMessages = recentMessages.Count > 0,
            Metrics = metrics
                .OrderBy(metric => metric.DisplayOrder)
                .ToList(),
            RecentMessages = recentMessages,
            QuickActions = await GetQuickActionsAsync()
        };
    }

    private async Task<long> GetProjectsCountAsync()
    {
        var queryable = await _portfolioProjectRepository.GetQueryableAsync();
        return await AsyncExecuter.LongCountAsync(queryable);
    }

    private async Task<long> GetSkillsCountAsync()
    {
        var queryable = await _portfolioSkillRepository.GetQueryableAsync();
        return await AsyncExecuter.LongCountAsync(queryable);
    }

    private async Task<long> GetContactMessagesCountAsync()
    {
        var queryable = await _portfolioContactMessageRepository.GetQueryableAsync();
        return await AsyncExecuter.LongCountAsync(queryable);
    }

    private async Task<long> GetUnreadMessagesCountAsync()
    {
        var queryable = await _portfolioContactMessageRepository.GetQueryableAsync();
        return await AsyncExecuter.LongCountAsync(
            queryable.Where(message => !message.IsArchived && !message.IsRead));
    }

    private async Task<IReadOnlyList<AdminDashboardRecentMessageDto>> GetRecentMessagesAsync()
    {
        var queryable = await _portfolioContactMessageRepository.GetQueryableAsync();
        var messages = await AsyncExecuter.ToListAsync(
            queryable
                .Where(message => !message.IsArchived)
                .OrderByDescending(message => message.CreationTime)
                .Take(PortfolioAdminDashboardConsts.MaxRecentMessages));

        return messages
            .Select(message => new AdminDashboardRecentMessageDto
            {
                Id = message.Id,
                Name = message.Name,
                Email = message.Email,
                Company = message.Company,
                Subject = message.Subject,
                MessagePreview = CreatePreview(message.Message),
                IsRead = message.IsRead,
                CreationTime = message.CreationTime
            })
            .ToList();
    }

    private async Task<IReadOnlyList<AdminDashboardQuickActionDto>> GetQuickActionsAsync()
    {
        var definition = _portfolioAppShellDefinitionProvider.Get();
        var quickActions = new List<AdminDashboardQuickActionDto>();

        foreach (var route in definition.Routes
                     .Where(route => route.Layout == PortfolioLayoutType.Admin)
                     .Where(route => route.Type != PortfolioRouteType.AdminLogin && route.Type != PortfolioRouteType.AdminDashboard)
                     .Where(route => route.IsNavigationVisible)
                     .Where(route => route.RequiresAuthentication)
                     .Where(route => !route.RequiredPermissionName.IsNullOrWhiteSpace())
                     .OrderBy(route => route.DisplayOrder))
        {
            if (!await _permissionChecker.IsGrantedAsync(route.RequiredPermissionName!))
            {
                continue;
            }

            quickActions.Add(new AdminDashboardQuickActionDto
            {
                RouteType = route.Type,
                Label = L[$"Enum:PortfolioRouteType.{route.Type}"],
                Path = route.Path,
                RequiredPermissionName = route.RequiredPermissionName!,
                DisplayOrder = route.DisplayOrder
            });
        }

        return quickActions;
    }

    private static string CreatePreview(string message)
    {
        if (message.Length <= PortfolioAdminDashboardConsts.MessagePreviewMaxLength)
        {
            return message;
        }

        return message[..(PortfolioAdminDashboardConsts.MessagePreviewMaxLength - 3)].TrimEnd() + "...";
    }
}
