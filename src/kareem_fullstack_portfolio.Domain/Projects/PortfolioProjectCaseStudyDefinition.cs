using System.Collections.Generic;
using System.Linq;
using Volo.Abp;

namespace kareem_fullstack_portfolio.Projects;

public class PortfolioProjectCaseStudyDefinition
{
    private const int SectionTextMaxLength = 1600;
    private const int ListItemMaxLength = 180;

    public string Slug { get; }

    public string Overview { get; }

    public string BusinessProblem { get; }

    public string Solution { get; }

    public string RoleSummary { get; }

    public IReadOnlyList<string> RoleResponsibilities { get; }

    public IReadOnlyList<string> KeyFeatures { get; }

    public IReadOnlyList<string> ArchitectureNotes { get; }

    public IReadOnlyList<PortfolioProjectCaseStudyHighlightCardDefinition> HighlightCards { get; }

    public IReadOnlyList<PortfolioProjectCaseStudyGalleryItemDefinition> GalleryItems { get; }

    public IReadOnlyList<string> Results { get; }

    public PortfolioProjectCaseStudyDefinition(
        string slug,
        string overview,
        string businessProblem,
        string solution,
        string roleSummary,
        IReadOnlyList<string> roleResponsibilities,
        IReadOnlyList<string> keyFeatures,
        IReadOnlyList<string> architectureNotes,
        IReadOnlyList<PortfolioProjectCaseStudyHighlightCardDefinition> highlightCards,
        IReadOnlyList<PortfolioProjectCaseStudyGalleryItemDefinition> galleryItems,
        IReadOnlyList<string> results)
    {
        Slug = slug?.Trim().ToLowerInvariant() ?? string.Empty;
        Overview = overview?.Trim() ?? string.Empty;
        BusinessProblem = businessProblem?.Trim() ?? string.Empty;
        Solution = solution?.Trim() ?? string.Empty;
        RoleSummary = roleSummary?.Trim() ?? string.Empty;
        RoleResponsibilities = roleResponsibilities ?? [];
        KeyFeatures = keyFeatures ?? [];
        ArchitectureNotes = architectureNotes ?? [];
        HighlightCards = highlightCards ?? [];
        GalleryItems = galleryItems ?? [];
        Results = results ?? [];
    }

    public void EnsureValid()
    {
        EnsureSlug();
        EnsureRequiredText(Overview, nameof(Overview));
        EnsureRequiredText(BusinessProblem, nameof(BusinessProblem));
        EnsureRequiredText(Solution, nameof(Solution));
        EnsureRequiredText(RoleSummary, nameof(RoleSummary));

        EnsureTextMaxLength(Overview, nameof(Overview), SectionTextMaxLength);
        EnsureTextMaxLength(BusinessProblem, nameof(BusinessProblem), SectionTextMaxLength);
        EnsureTextMaxLength(Solution, nameof(Solution), SectionTextMaxLength);
        EnsureTextMaxLength(RoleSummary, nameof(RoleSummary), SectionTextMaxLength);

        EnsureList(RoleResponsibilities, "KareemRole", requireAtLeastOneItem: true);
        EnsureList(KeyFeatures, "KeyFeatures", requireAtLeastOneItem: false);
        EnsureList(ArchitectureNotes, "ArchitectureNotes", requireAtLeastOneItem: false);
        EnsureList(Results, "ResultsImpact", requireAtLeastOneItem: true);

        foreach (var item in GalleryItems)
        {
            item.EnsureValid();
        }

        foreach (var card in HighlightCards)
        {
            card.EnsureValid();
        }
    }

    private void EnsureSlug()
    {
        if (!string.IsNullOrWhiteSpace(Slug))
        {
            return;
        }

        throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectCaseStudySlugRequired);
    }

    private static void EnsureRequiredText(string value, string sectionName)
    {
        if (!string.IsNullOrWhiteSpace(value))
        {
            return;
        }

        throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectCaseStudySectionRequired)
            .WithData("SectionName", sectionName);
    }

    private static void EnsureTextMaxLength(string value, string sectionName, int maxLength)
    {
        if (value.Length <= maxLength)
        {
            return;
        }

        throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectCaseStudyTextTooLong)
            .WithData("SectionName", sectionName)
            .WithData("FieldName", "Text")
            .WithData("MaxLength", maxLength);
    }

    private static void EnsureList(IReadOnlyList<string> items, string sectionName, bool requireAtLeastOneItem)
    {
        if (requireAtLeastOneItem && items.Count == 0)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectCaseStudyListItemRequired)
                .WithData("SectionName", sectionName);
        }

        foreach (var item in items.Where(string.IsNullOrWhiteSpace))
        {
            _ = item;
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectCaseStudyListItemRequired)
                .WithData("SectionName", sectionName);
        }

        foreach (var item in items.Where(item => item.Length > ListItemMaxLength))
        {
            _ = item;
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectCaseStudyTextTooLong)
                .WithData("SectionName", sectionName)
                .WithData("FieldName", "Item")
                .WithData("MaxLength", ListItemMaxLength);
        }
    }
}
