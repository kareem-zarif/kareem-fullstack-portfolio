using System;
using System.Net.Mail;
using Volo.Abp;
using Volo.Abp.Domain.Entities.Auditing;

namespace kareem_fullstack_portfolio.ContactMessages;

public class PortfolioContactMessage : FullAuditedAggregateRoot<Guid>
{
    public string Name { get; private set; } = string.Empty;

    public string Email { get; private set; } = string.Empty;

    public string? Company { get; private set; }

    public string Subject { get; private set; } = string.Empty;

    public string Message { get; private set; } = string.Empty;

    public bool IsRead { get; private set; }

    public DateTime? ReadTime { get; private set; }

    public bool IsArchived { get; private set; }

    public DateTime? ArchivedTime { get; private set; }

    protected PortfolioContactMessage()
    {
    }

    public PortfolioContactMessage(
        Guid id,
        string name,
        string email,
        string? company,
        string subject,
        string message)
        : base(id)
    {
        SetName(name);
        SetEmail(email);
        SetCompany(company);
        SetSubject(subject);
        SetMessage(message);
    }

    public void MarkAsRead(DateTime readTime)
    {
        IsRead = true;
        ReadTime = readTime;
    }

    public void MarkAsUnread()
    {
        IsRead = false;
        ReadTime = null;
    }

    public void Archive(DateTime archivedTime)
    {
        IsArchived = true;
        ArchivedTime = archivedTime;
    }

    public void Restore()
    {
        IsArchived = false;
        ArchivedTime = null;
    }

    private void SetName(string name)
    {
        Name = NormalizeRequiredText(
            name,
            kareem_fullstack_portfolioDomainErrorCodes.PortfolioContactMessageNameRequired,
            kareem_fullstack_portfolioDomainErrorCodes.PortfolioContactMessageNameTooLong,
            PortfolioContactMessageConsts.MaxNameLength);
    }

    private void SetEmail(string email)
    {
        if (email.IsNullOrWhiteSpace())
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioContactMessageEmailRequired);
        }

        var normalizedEmail = email.Trim();

        if (normalizedEmail.Length > PortfolioContactMessageConsts.MaxEmailLength)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioContactMessageEmailTooLong)
                .WithData("MaxLength", PortfolioContactMessageConsts.MaxEmailLength);
        }

        try
        {
            _ = new MailAddress(normalizedEmail);
        }
        catch (FormatException)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioContactMessageEmailInvalid)
                .WithData("Email", normalizedEmail);
        }

        Email = normalizedEmail;
    }

    private void SetCompany(string? company)
    {
        if (company.IsNullOrWhiteSpace())
        {
            Company = null;
            return;
        }

        var normalizedCompany = company.Trim();

        if (normalizedCompany.Length > PortfolioContactMessageConsts.MaxCompanyLength)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioContactMessageCompanyTooLong)
                .WithData("MaxLength", PortfolioContactMessageConsts.MaxCompanyLength);
        }

        Company = normalizedCompany;
    }

    private void SetSubject(string subject)
    {
        Subject = NormalizeRequiredText(
            subject,
            kareem_fullstack_portfolioDomainErrorCodes.PortfolioContactMessageSubjectRequired,
            kareem_fullstack_portfolioDomainErrorCodes.PortfolioContactMessageSubjectTooLong,
            PortfolioContactMessageConsts.MaxSubjectLength);
    }

    private void SetMessage(string message)
    {
        Message = NormalizeRequiredText(
            message,
            kareem_fullstack_portfolioDomainErrorCodes.PortfolioContactMessageBodyRequired,
            kareem_fullstack_portfolioDomainErrorCodes.PortfolioContactMessageBodyTooLong,
            PortfolioContactMessageConsts.MaxMessageLength);
    }

    private static string NormalizeRequiredText(
        string value,
        string requiredErrorCode,
        string tooLongErrorCode,
        int maxLength)
    {
        if (value.IsNullOrWhiteSpace())
        {
            throw new BusinessException(requiredErrorCode);
        }

        var normalizedValue = value.Trim();

        if (normalizedValue.Length > maxLength)
        {
            throw new BusinessException(tooLongErrorCode)
                .WithData("MaxLength", maxLength);
        }

        return normalizedValue;
    }
}
