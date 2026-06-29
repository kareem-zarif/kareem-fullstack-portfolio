using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kareem_fullstack_portfolio.Migrations
{
    /// <inheritdoc />
    public partial class Add_PortfolioProject_GitHubFrontendUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GitHubFrontendUrl",
                table: "AppPortfolioProjects",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GitHubFrontendUrl",
                table: "AppPortfolioProjects");
        }
    }
}
