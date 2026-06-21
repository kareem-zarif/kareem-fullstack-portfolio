using System;

namespace kareem_fullstack_portfolio.ContactMessages;

public class PortfolioContactSubmissionResultDto
{
    public Guid SubmissionId { get; set; }

    public DateTime SubmittedAtUtc { get; set; }
}
