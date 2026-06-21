using System.ComponentModel.DataAnnotations;

namespace kareem_fullstack_portfolio.ContactMessages;

public class CreatePortfolioContactMessageDto
{
    [Required]
    [StringLength(PortfolioContactMessageConsts.MaxNameLength)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(PortfolioContactMessageConsts.MaxEmailLength)]
    public string Email { get; set; } = string.Empty;

    [StringLength(PortfolioContactMessageConsts.MaxCompanyLength)]
    public string? Company { get; set; }

    [Required]
    [StringLength(PortfolioContactMessageConsts.MaxSubjectLength)]
    public string Subject { get; set; } = string.Empty;

    [Required]
    [StringLength(PortfolioContactMessageConsts.MaxMessageLength)]
    public string Message { get; set; } = string.Empty;

    [StringLength(PortfolioContactMessageConsts.MaxHoneypotLength)]
    public string? Honeypot { get; set; }
}
