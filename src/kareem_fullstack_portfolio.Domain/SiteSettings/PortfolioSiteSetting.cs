using System;
using System.Net.Mail;
using System.Text.Json;
using System.Text.RegularExpressions;
using Volo.Abp;
using Volo.Abp.Domain.Entities.Auditing;

namespace kareem_fullstack_portfolio.SiteSettings;

public class PortfolioSiteSetting : FullAuditedAggregateRoot<Guid>
{
    private static readonly Regex KeyRegex = new("^[a-z0-9]+(?:[.-][a-z0-9]+)*$", RegexOptions.Compiled);

    public string Key { get; private set; } = string.Empty;

    public string Value { get; private set; } = string.Empty;

    public PortfolioSiteSettingValueType ValueType { get; private set; }

    public bool IsPublic { get; private set; }

    public bool IsActive { get; private set; }

    public int DisplayOrder { get; private set; }

    protected PortfolioSiteSetting()
    {
    }

    public PortfolioSiteSetting(
        Guid id,
        string key,
        string value,
        PortfolioSiteSettingValueType valueType,
        bool isPublic,
        bool isActive,
        int displayOrder)
        : base(id)
    {
        SetKey(key);
        SetValue(value, valueType);
        SetDisplayOrder(displayOrder);

        IsPublic = isPublic;
        IsActive = isActive;
    }

    public void Update(
        string key,
        string value,
        PortfolioSiteSettingValueType valueType,
        bool isPublic,
        bool isActive,
        int displayOrder)
    {
        SetKey(key);
        SetValue(value, valueType);
        SetDisplayOrder(displayOrder);

        IsPublic = isPublic;
        IsActive = isActive;
    }

    private void SetKey(string key)
    {
        if (key.IsNullOrWhiteSpace())
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioSiteSettingKeyRequired);
        }

        var normalizedKey = key.Trim().ToLowerInvariant();

        if (normalizedKey.Length > PortfolioSiteSettingConsts.MaxKeyLength)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioSiteSettingKeyTooLong)
                .WithData("MaxLength", PortfolioSiteSettingConsts.MaxKeyLength);
        }

        if (!KeyRegex.IsMatch(normalizedKey))
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioSiteSettingKeyInvalid)
                .WithData("Key", normalizedKey);
        }

        Key = normalizedKey;
    }

    private void SetValue(string value, PortfolioSiteSettingValueType valueType)
    {
        if (value.IsNullOrWhiteSpace())
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioSiteSettingValueRequired);
        }

        var normalizedValue = value.Trim();

        if (normalizedValue.Length > PortfolioSiteSettingConsts.MaxValueLength)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioSiteSettingValueTooLong)
                .WithData("MaxLength", PortfolioSiteSettingConsts.MaxValueLength);
        }

        ValidateValueType(normalizedValue, valueType);

        Value = normalizedValue;
        ValueType = valueType;
    }

    private void SetDisplayOrder(int displayOrder)
    {
        if (displayOrder < 0)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioSiteSettingDisplayOrderMustBeZeroOrPositive);
        }

        DisplayOrder = displayOrder;
    }

    private static void ValidateValueType(string value, PortfolioSiteSettingValueType valueType)
    {
        switch (valueType)
        {
            case PortfolioSiteSettingValueType.Text:
                return;
            case PortfolioSiteSettingValueType.Url:
                if (value.StartsWith("/"))
                {
                    return;
                }

                if (Uri.TryCreate(value, UriKind.Absolute, out var uri) &&
                    (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
                {
                    return;
                }

                throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioSiteSettingValueFormatInvalid)
                    .WithData("ValueType", valueType.ToString())
                    .WithData("Value", value);
            case PortfolioSiteSettingValueType.Email:
                try
                {
                    _ = new MailAddress(value);
                    return;
                }
                catch (FormatException)
                {
                    throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioSiteSettingValueFormatInvalid)
                        .WithData("ValueType", valueType.ToString())
                        .WithData("Value", value);
                }
            case PortfolioSiteSettingValueType.Json:
                try
                {
                    JsonDocument.Parse(value);
                    return;
                }
                catch (JsonException)
                {
                    throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioSiteSettingValueFormatInvalid)
                        .WithData("ValueType", valueType.ToString())
                        .WithData("Value", value);
                }
            default:
                throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioSiteSettingValueFormatInvalid)
                    .WithData("ValueType", valueType.ToString())
                    .WithData("Value", value);
        }
    }
}
