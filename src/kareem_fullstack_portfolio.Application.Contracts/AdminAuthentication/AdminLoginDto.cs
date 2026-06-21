using System.ComponentModel.DataAnnotations;

namespace kareem_fullstack_portfolio.AdminAuthentication;

public class AdminLoginDto
{
    [Required]
    [StringLength(256)]
    public string UserNameOrEmailAddress { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}
