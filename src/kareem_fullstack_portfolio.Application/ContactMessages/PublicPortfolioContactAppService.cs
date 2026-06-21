using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;

namespace kareem_fullstack_portfolio.ContactMessages;

[AllowAnonymous]
[Route("api/contact")]
public class PublicPortfolioContactAppService : kareem_fullstack_portfolioAppService, IPublicPortfolioContactAppService
{
    private readonly IRepository<PortfolioContactMessage, Guid> _portfolioContactMessageRepository;

    public PublicPortfolioContactAppService(IRepository<PortfolioContactMessage, Guid> portfolioContactMessageRepository)
    {
        _portfolioContactMessageRepository = portfolioContactMessageRepository;
    }

    [HttpPost]
    public async Task<PortfolioContactSubmissionResultDto> SubmitAsync(CreatePortfolioContactMessageDto input)
    {
        ArgumentNullException.ThrowIfNull(input);
        var submissionId = GuidGenerator.Create();
        var submittedAtUtc = DateTime.UtcNow;

        if (!input.Honeypot.IsNullOrWhiteSpace())
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioContactMessageSpamDetected);
        }

        var message = new PortfolioContactMessage(
            submissionId,
            input.Name,
            input.Email,
            input.Company,
            input.Subject,
            input.Message);

        await _portfolioContactMessageRepository.InsertAsync(message, autoSave: true);

        return new PortfolioContactSubmissionResultDto
        {
            SubmissionId = submissionId,
            SubmittedAtUtc = submittedAtUtc
        };
    }
}
