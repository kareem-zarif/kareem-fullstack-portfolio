using System;
using System.Collections.Generic;

namespace kareem_fullstack_portfolio.AdminAuthentication;

public class AdminCurrentUserDto
{
    public Guid Id { get; set; }

    public string UserName { get; set; } = string.Empty;

    public string? Email { get; set; }

    public IReadOnlyList<string> GrantedPermissions { get; set; } = Array.Empty<string>();
}
