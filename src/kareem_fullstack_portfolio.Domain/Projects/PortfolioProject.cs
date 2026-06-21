using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Text.Json;
using Volo.Abp;
using Volo.Abp.Domain.Entities.Auditing;

namespace kareem_fullstack_portfolio.Projects;

public class PortfolioProject : FullAuditedAggregateRoot<Guid>
{
    private static readonly Regex SlugRegex = new("^[a-z0-9]+(?:-[a-z0-9]+)*$", RegexOptions.Compiled);
    private static readonly JsonSerializerOptions CaseStudyContentSerializerOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public string Title { get; private set; } = string.Empty;

    public string Slug { get; private set; } = string.Empty;

    public PortfolioProjectType ProjectType { get; private set; }

    public string ShortSummary { get; private set; } = string.Empty;

    public string BusinessValue { get; private set; } = string.Empty;

    public bool IsFeatured { get; private set; }

    public bool IsActive { get; private set; }

    public string? GitHubUrl { get; private set; }

    public string? LiveDemoUrl { get; private set; }

    public int DisplayOrder { get; private set; }

    public ICollection<PortfolioProjectTechnology> TechStack { get; private set; } = new List<PortfolioProjectTechnology>();

    protected PortfolioProject()
    {
    }

    public PortfolioProject(
        Guid id,
        string title,
        string slug,
        PortfolioProjectType projectType,
        string shortSummary,
        string businessValue,
        IReadOnlyCollection<string> techStack,
        bool isFeatured,
        bool isActive,
        string? gitHubUrl,
        string? liveDemoUrl,
        int displayOrder)
        : base(id)
    {
        SetTitle(title);
        SetSlug(slug);
        SetProjectType(projectType);
        SetShortSummary(shortSummary);
        SetBusinessValue(businessValue);
        SetExternalUrls(gitHubUrl, liveDemoUrl);
        SetDisplayOrder(displayOrder);
        SetTechStack(techStack);

        IsFeatured = isFeatured;
        IsActive = isActive;
    }

    public void Update(
        string title,
        string slug,
        PortfolioProjectType projectType,
        string shortSummary,
        string businessValue,
        IReadOnlyCollection<string> techStack,
        bool isFeatured,
        bool isActive,
        string? gitHubUrl,
        string? liveDemoUrl,
        int displayOrder)
    {
        SetTitle(title);
        SetSlug(slug);
        SetProjectType(projectType);
        SetShortSummary(shortSummary);
        SetBusinessValue(businessValue);
        SetExternalUrls(gitHubUrl, liveDemoUrl);
        SetDisplayOrder(displayOrder);
        SetTechStack(techStack);

        IsFeatured = isFeatured;
        IsActive = isActive;
    }

    public string GetCaseStudyRoute()
    {
        return $"/projects/{Slug}";
    }

    public void SetCaseStudyContent(PortfolioProjectCaseStudyContent caseStudyContent)
    {
        ArgumentNullException.ThrowIfNull(caseStudyContent);

        var normalizedDefinition = caseStudyContent.ToDefinition(Slug);
        var normalizedContent = PortfolioProjectCaseStudyContent.FromDefinition(normalizedDefinition);
        ExtraProperties[PortfolioProjectCaseStudyConsts.ExtraPropertyName] =
            JsonSerializer.Serialize(normalizedContent, CaseStudyContentSerializerOptions);
    }

    public PortfolioProjectCaseStudyContent? GetCaseStudyContent()
    {
        if (!ExtraProperties.TryGetValue(PortfolioProjectCaseStudyConsts.ExtraPropertyName, out var rawValue) || rawValue is null)
        {
            return null;
        }

        var json = rawValue switch
        {
            string stringValue => stringValue,
            JsonElement { ValueKind: JsonValueKind.String } jsonElement => jsonElement.GetString(),
            JsonElement jsonElement => jsonElement.GetRawText(),
            _ => rawValue.ToString()
        };

        if (json.IsNullOrWhiteSpace())
        {
            return null;
        }

        var content = JsonSerializer.Deserialize<PortfolioProjectCaseStudyContent>(json, CaseStudyContentSerializerOptions);

        return content;
    }

    public bool HasCaseStudyContent()
    {
        return GetCaseStudyContent() is not null;
    }

    public void SetFeatured(bool isFeatured)
    {
        IsFeatured = isFeatured;
    }

    public void SetActive(bool isActive)
    {
        IsActive = isActive;
    }

    private void SetTitle(string title)
    {
        if (title.IsNullOrWhiteSpace())
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectTitleRequired);
        }

        var normalizedTitle = title.Trim();

        if (normalizedTitle.Length > PortfolioProjectConsts.MaxTitleLength)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectTitleTooLong)
                .WithData("MaxLength", PortfolioProjectConsts.MaxTitleLength);
        }

        Title = normalizedTitle;
    }

    private void SetSlug(string slug)
    {
        if (slug.IsNullOrWhiteSpace())
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectSlugRequired);
        }

        var normalizedSlug = slug.Trim().ToLowerInvariant();

        if (normalizedSlug.Length > PortfolioProjectConsts.MaxSlugLength)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectSlugTooLong)
                .WithData("MaxLength", PortfolioProjectConsts.MaxSlugLength);
        }

        if (!SlugRegex.IsMatch(normalizedSlug))
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectSlugInvalid)
                .WithData("Slug", normalizedSlug);
        }

        Slug = normalizedSlug;
    }

    private void SetProjectType(PortfolioProjectType projectType)
    {
        ProjectType = projectType;
    }

    private void SetShortSummary(string shortSummary)
    {
        if (shortSummary.IsNullOrWhiteSpace())
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectShortSummaryRequired);
        }

        var normalizedSummary = shortSummary.Trim();

        if (normalizedSummary.Length > PortfolioProjectConsts.MaxShortSummaryLength)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectShortSummaryTooLong)
                .WithData("MaxLength", PortfolioProjectConsts.MaxShortSummaryLength);
        }

        ShortSummary = normalizedSummary;
    }

    private void SetBusinessValue(string businessValue)
    {
        if (businessValue.IsNullOrWhiteSpace())
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectBusinessValueRequired);
        }

        var normalizedBusinessValue = businessValue.Trim();

        if (normalizedBusinessValue.Length > PortfolioProjectConsts.MaxBusinessValueLength)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectBusinessValueTooLong)
                .WithData("MaxLength", PortfolioProjectConsts.MaxBusinessValueLength);
        }

        BusinessValue = normalizedBusinessValue;
    }

    private void SetExternalUrls(string? gitHubUrl, string? liveDemoUrl)
    {
        GitHubUrl = NormalizeUrl(gitHubUrl, "GitHubUrl");
        LiveDemoUrl = NormalizeUrl(liveDemoUrl, "LiveDemoUrl");
    }

    private void SetDisplayOrder(int displayOrder)
    {
        if (displayOrder < 0)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectDisplayOrderMustBeZeroOrPositive);
        }

        DisplayOrder = displayOrder;
    }

    private void SetTechStack(IReadOnlyCollection<string> techStack)
    {
        if (techStack is null || techStack.Count == 0)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectTechStackRequired);
        }

        var normalizedTechnologies = techStack
            .Select(name =>
            {
                if (name.IsNullOrWhiteSpace())
                {
                    throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectTechnologyNameRequired);
                }

                var normalizedName = name.Trim();

                if (normalizedName.Length > PortfolioProjectConsts.MaxTechnologyNameLength)
                {
                    throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectTechnologyNameTooLong)
                        .WithData("MaxLength", PortfolioProjectConsts.MaxTechnologyNameLength);
                }

                return normalizedName;
            })
            .ToList();

        var duplicateTechnology = normalizedTechnologies
            .GroupBy(name => name, StringComparer.OrdinalIgnoreCase)
            .FirstOrDefault(group => group.Count() > 1);

        if (duplicateTechnology is not null)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectDuplicateTechnology)
                .WithData("Technology", duplicateTechnology.Key);
        }

        TechStack.Clear();

        for (var index = 0; index < normalizedTechnologies.Count; index++)
        {
            TechStack.Add(new PortfolioProjectTechnology(
                Guid.NewGuid(),
                Id,
                normalizedTechnologies[index],
                index));
        }
    }

    private static string? NormalizeUrl(string? url, string fieldName)
    {
        if (url.IsNullOrWhiteSpace())
        {
            return null;
        }

        var normalizedUrl = url.Trim();

        if (normalizedUrl.Length > PortfolioProjectConsts.MaxUrlLength)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectExternalUrlInvalid)
                .WithData("FieldName", fieldName)
                .WithData("Url", normalizedUrl);
        }

        var isValidAbsoluteUrl = Uri.TryCreate(normalizedUrl, UriKind.Absolute, out var parsedUri) &&
                                 (parsedUri.Scheme == Uri.UriSchemeHttp || parsedUri.Scheme == Uri.UriSchemeHttps);

        if (!isValidAbsoluteUrl)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectExternalUrlInvalid)
                .WithData("FieldName", fieldName)
                .WithData("Url", normalizedUrl);
        }

        return normalizedUrl;
    }
}
