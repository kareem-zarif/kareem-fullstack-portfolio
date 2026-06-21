namespace kareem_fullstack_portfolio.ContactMessages;

public class CreatePortfolioContactMessageDto
{
    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? Company { get; set; }

    public string Subject { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public string? Honeypot { get; set; }
}
