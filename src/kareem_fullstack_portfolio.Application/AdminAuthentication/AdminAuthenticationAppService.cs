using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using kareem_fullstack_portfolio.Permissions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Distributed;
using Volo.Abp;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Identity;
using Volo.Abp.Security.Claims;
using AbpIdentityUser = Volo.Abp.Identity.IdentityUser;

namespace kareem_fullstack_portfolio.AdminAuthentication;

[AllowAnonymous]
[Route("api/admin/authentication")]
public class AdminAuthenticationAppService : kareem_fullstack_portfolioAppService, IAdminAuthenticationAppService
{
    private const string RevokedTokenCacheKeyPrefix = "portfolio-admin-auth:revoked:";

    private readonly IdentityUserManager _identityUserManager;
    private readonly SignInManager<AbpIdentityUser> _signInManager;
    private readonly IUserClaimsPrincipalFactory<AbpIdentityUser> _userClaimsPrincipalFactory;
    private readonly ICurrentPrincipalAccessor _currentPrincipalAccessor;
    private readonly IPermissionChecker _permissionChecker;
    private readonly PortfolioAdminJwtTokenGenerator _portfolioAdminJwtTokenGenerator;
    private readonly IDistributedCache _distributedCache;

    public AdminAuthenticationAppService(
        IdentityUserManager identityUserManager,
        SignInManager<AbpIdentityUser> signInManager,
        IUserClaimsPrincipalFactory<AbpIdentityUser> userClaimsPrincipalFactory,
        ICurrentPrincipalAccessor currentPrincipalAccessor,
        IPermissionChecker permissionChecker,
        PortfolioAdminJwtTokenGenerator portfolioAdminJwtTokenGenerator,
        IDistributedCache distributedCache)
    {
        _identityUserManager = identityUserManager;
        _signInManager = signInManager;
        _userClaimsPrincipalFactory = userClaimsPrincipalFactory;
        _currentPrincipalAccessor = currentPrincipalAccessor;
        _permissionChecker = permissionChecker;
        _portfolioAdminJwtTokenGenerator = portfolioAdminJwtTokenGenerator;
        _distributedCache = distributedCache;
    }

    [HttpPost("login")]
    public async Task<AdminLoginResultDto> LoginAsync(AdminLoginDto input)
    {
        ArgumentNullException.ThrowIfNull(input);

        var user = await FindUserAsync(input.UserNameOrEmailAddress);
        if (user == null)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.AdminAuthenticationInvalidCredentials);
        }

        if (!user.IsActive)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.AdminAuthenticationUserInactive);
        }

        if (await _identityUserManager.IsLockedOutAsync(user))
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.AdminAuthenticationUserLockedOut);
        }

        var signInResult = await _signInManager.CheckPasswordSignInAsync(user, input.Password, lockoutOnFailure: true);
        if (signInResult.IsLockedOut)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.AdminAuthenticationUserLockedOut);
        }

        if (!signInResult.Succeeded)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.AdminAuthenticationInvalidCredentials);
        }

        var principal = await _userClaimsPrincipalFactory.CreateAsync(user);
        var grantedPermissions = await GetGrantedPermissionsAsync(principal);
        if (!grantedPermissions.Contains(kareem_fullstack_portfolioPermissions.Admin.Access, StringComparer.Ordinal))
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.AdminAuthenticationAdminAccessRequired);
        }

        var accessToken = await _portfolioAdminJwtTokenGenerator.GenerateAsync(user);

        return new AdminLoginResultDto
        {
            AccessToken = accessToken.AccessToken,
            TokenType = "Bearer",
            ExpiresAtUtc = accessToken.ExpiresAtUtc,
            ExpiresInSeconds = Math.Max(1, (int)(accessToken.ExpiresAtUtc - DateTime.UtcNow).TotalSeconds),
            User = CreateCurrentUserDto(user, grantedPermissions)
        };
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task LogoutAsync()
    {
        var currentPrincipal = _currentPrincipalAccessor.Principal;
        var jti = currentPrincipal?.FindFirst(PortfolioAdminAuthenticationClaimNames.TokenId)?.Value;
        if (jti.IsNullOrWhiteSpace())
        {
            return;
        }

        var expirationClaimValue = currentPrincipal?.FindFirst(PortfolioAdminAuthenticationClaimNames.ExpirationTime)?.Value;
        if (!long.TryParse(expirationClaimValue, out var expirationUnixSeconds))
        {
            return;
        }

        var expiresAtUtc = DateTimeOffset.FromUnixTimeSeconds(expirationUnixSeconds);
        var remainingLifetime = expiresAtUtc - DateTimeOffset.UtcNow;
        if (remainingLifetime <= TimeSpan.Zero)
        {
            return;
        }

        await _distributedCache.SetStringAsync(
            BuildRevokedTokenCacheKey(jti),
            "revoked",
            new DistributedCacheEntryOptions
            {
                AbsoluteExpiration = expiresAtUtc
            });
    }

    [Authorize(kareem_fullstack_portfolioPermissions.Admin.Access)]
    [HttpGet("current")]
    public async Task<AdminCurrentUserDto> GetCurrentAsync()
    {
        if (CurrentUser.Id == null)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.AdminAuthenticationCurrentUserUnavailable);
        }

        var user = await _identityUserManager.FindByIdAsync(CurrentUser.Id.Value.ToString());
        if (user == null || !user.IsActive)
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.AdminAuthenticationCurrentUserUnavailable);
        }

        var grantedPermissions = await GetGrantedPermissionsAsync(_currentPrincipalAccessor.Principal);
        return CreateCurrentUserDto(user, grantedPermissions);
    }

    public static string BuildRevokedTokenCacheKey(string jti)
    {
        return RevokedTokenCacheKeyPrefix + jti;
    }

    private async Task<AbpIdentityUser?> FindUserAsync(string userNameOrEmailAddress)
    {
        var normalizedValue = userNameOrEmailAddress.Trim();
        if (normalizedValue.IsNullOrWhiteSpace())
        {
            return null;
        }

        AbpIdentityUser? user;
        if (normalizedValue.Contains("@", StringComparison.Ordinal))
        {
            user = await _identityUserManager.FindByEmailAsync(normalizedValue);
            if (user != null)
            {
                return user;
            }
        }

        user = await _identityUserManager.FindByNameAsync(normalizedValue);
        if (user != null)
        {
            return user;
        }

        return normalizedValue.Contains("@", StringComparison.Ordinal)
            ? await _identityUserManager.FindByNameAsync(normalizedValue)
            : await _identityUserManager.FindByEmailAsync(normalizedValue);
    }

    private async Task<IReadOnlyList<string>> GetGrantedPermissionsAsync(ClaimsPrincipal principal)
    {
        using (_currentPrincipalAccessor.Change(principal))
        {
            var grantedPermissions = new List<string>();
            foreach (var permissionName in kareem_fullstack_portfolioPermissions.GetAll())
            {
                if (await _permissionChecker.IsGrantedAsync(permissionName))
                {
                    grantedPermissions.Add(permissionName);
                }
            }

            return grantedPermissions;
        }
    }

    private static AdminCurrentUserDto CreateCurrentUserDto(AbpIdentityUser user, IReadOnlyList<string> grantedPermissions)
    {
        return new AdminCurrentUserDto
        {
            Id = user.Id,
            UserName = user.UserName ?? string.Empty,
            Email = user.Email,
            GrantedPermissions = grantedPermissions
        };
    }
}
