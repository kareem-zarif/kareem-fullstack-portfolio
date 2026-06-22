using System;
using System.Linq;
using System.Threading.Tasks;
using kareem_fullstack_portfolio.Permissions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;

namespace kareem_fullstack_portfolio.ContactMessages;

[Authorize(kareem_fullstack_portfolioPermissions.Admin.Access)]
[Route("api/admin/messages")]
public class AdminPortfolioContactMessageAppService : kareem_fullstack_portfolioAppService, IAdminPortfolioContactMessageAppService
{
    private readonly IRepository<PortfolioContactMessage, Guid> _portfolioContactMessageRepository;

    public AdminPortfolioContactMessageAppService(IRepository<PortfolioContactMessage, Guid> portfolioContactMessageRepository)
    {
        _portfolioContactMessageRepository = portfolioContactMessageRepository;
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Messages.Default)]
    [HttpGet]
    public async Task<AdminPortfolioContactMessageListDto> GetListAsync(GetAdminPortfolioContactMessageListInput input)
    {
        input ??= new GetAdminPortfolioContactMessageListInput();

        var queryable = await _portfolioContactMessageRepository.GetQueryableAsync();
        var normalizedSearchText = NormalizeSearchText(input.SearchText);

        var filteredMessages = await AsyncExecuter.ToListAsync(
            queryable
                .Where(message => !message.IsArchived)
                .Where(message => !input.IsUnreadOnly || !message.IsRead)
                .Where(message => normalizedSearchText.IsNullOrWhiteSpace() || MatchesSearch(message, normalizedSearchText))
                .OrderBy(message => message.IsRead)
                .ThenByDescending(message => message.CreationTime)
                .ThenBy(message => message.Name));

        return new AdminPortfolioContactMessageListDto
        {
            Items = filteredMessages
                .Select(MapAdminListItemDto)
                .ToList(),
            AppliedSearchText = normalizedSearchText,
            AppliedIsUnreadOnly = input.IsUnreadOnly,
            TotalCount = filteredMessages.Count
        };
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Messages.Default)]
    [HttpGet("{id:guid}")]
    public async Task<PortfolioContactMessageAdminDto> GetAsync(Guid id)
    {
        var message = await GetActiveMessageAsync(id);
        return MapAdminDto(message);
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Messages.Manage)]
    [HttpPatch("{id:guid}/read-status")]
    public async Task<PortfolioContactMessageAdminDto> SetReadStatusAsync(Guid id, SetPortfolioContactMessageReadStatusDto input)
    {
        ArgumentNullException.ThrowIfNull(input);

        var message = await GetActiveMessageAsync(id);

        if (input.IsRead)
        {
            message.MarkAsRead(DateTime.UtcNow);
        }
        else
        {
            message.MarkAsUnread();
        }

        await _portfolioContactMessageRepository.UpdateAsync(message, autoSave: true);

        return MapAdminDto(message);
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Messages.Manage)]
    [HttpDelete("{id:guid}")]
    public async Task DeleteAsync(Guid id)
    {
        var message = await GetActiveMessageAsync(id);

        message.Archive(DateTime.UtcNow);

        await _portfolioContactMessageRepository.UpdateAsync(message, autoSave: true);
    }

    private async Task<PortfolioContactMessage> GetActiveMessageAsync(Guid id)
    {
        var queryable = await _portfolioContactMessageRepository.GetQueryableAsync();
        var message = await AsyncExecuter.FirstOrDefaultAsync(
            queryable.Where(contactMessage => contactMessage.Id == id && !contactMessage.IsArchived));

        return message ?? throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioContactMessageNotFound)
            .WithData("MessageId", id);
    }

    private PortfolioContactMessageAdminListItemDto MapAdminListItemDto(PortfolioContactMessage message)
    {
        var status = GetStatus(message);
        var messagePreview = CreatePreview(message.Message, out var isPreviewTruncated);

        return new PortfolioContactMessageAdminListItemDto
        {
            Id = message.Id,
            Name = message.Name,
            Email = message.Email,
            Company = message.Company,
            Subject = message.Subject,
            MessagePreview = messagePreview,
            IsMessagePreviewTruncated = isPreviewTruncated,
            IsRead = message.IsRead,
            Status = status,
            StatusLabel = L[$"Enum:PortfolioContactMessageStatus.{status}"],
            CreationTime = message.CreationTime
        };
    }

    private PortfolioContactMessageAdminDto MapAdminDto(PortfolioContactMessage message)
    {
        var status = GetStatus(message);

        return new PortfolioContactMessageAdminDto
        {
            Id = message.Id,
            Name = message.Name,
            Email = message.Email,
            Company = message.Company,
            Subject = message.Subject,
            Message = message.Message,
            IsRead = message.IsRead,
            Status = status,
            StatusLabel = L[$"Enum:PortfolioContactMessageStatus.{status}"],
            CreationTime = message.CreationTime,
            ReadTime = message.ReadTime,
            IsArchived = message.IsArchived,
            ArchivedTime = message.ArchivedTime
        };
    }

    private static bool MatchesSearch(PortfolioContactMessage message, string searchText)
    {
        return message.Name.Contains(searchText, StringComparison.OrdinalIgnoreCase) ||
               message.Email.Contains(searchText, StringComparison.OrdinalIgnoreCase) ||
               (message.Company?.Contains(searchText, StringComparison.OrdinalIgnoreCase) ?? false) ||
               message.Subject.Contains(searchText, StringComparison.OrdinalIgnoreCase);
    }

    private static string? NormalizeSearchText(string? searchText)
    {
        return searchText.IsNullOrWhiteSpace()
            ? null
            : searchText.Trim();
    }

    private static string CreatePreview(string message, out bool isTruncated)
    {
        if (message.Length <= PortfolioAdminContactMessageConsts.MessagePreviewMaxLength)
        {
            isTruncated = false;
            return message;
        }

        isTruncated = true;
        return message[..(PortfolioAdminContactMessageConsts.MessagePreviewMaxLength - 3)].TrimEnd() + "...";
    }

    private static PortfolioContactMessageStatus GetStatus(PortfolioContactMessage message)
    {
        if (message.IsArchived)
        {
            return PortfolioContactMessageStatus.Archived;
        }

        return message.IsRead
            ? PortfolioContactMessageStatus.Read
            : PortfolioContactMessageStatus.Unread;
    }
}
