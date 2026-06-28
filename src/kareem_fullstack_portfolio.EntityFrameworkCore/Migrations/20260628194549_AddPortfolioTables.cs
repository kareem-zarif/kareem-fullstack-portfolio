using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kareem_fullstack_portfolio.Migrations
{
    /// <inheritdoc />
    public partial class AddPortfolioTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppPortfolioContactMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Company = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    Subject = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    ReadTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsArchived = table.Column<bool>(type: "bit", nullable: false),
                    ArchivedTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExtraProperties = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DeleterId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppPortfolioContactMessages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppPortfolioExperiences",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    StageLabel = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Organization = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Summary = table.Column<string>(type: "nvarchar(220)", maxLength: 220, nullable: false),
                    BusinessValue = table.Column<string>(type: "nvarchar(220)", maxLength: 220, nullable: false),
                    IsPrimaryProfessionalExperience = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    ExtraProperties = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DeleterId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppPortfolioExperiences", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppPortfolioProjects",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    ProjectType = table.Column<int>(type: "int", nullable: false),
                    ShortSummary = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    BusinessValue = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsFeatured = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    GitHubUrl = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: true),
                    LiveDemoUrl = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    ExtraProperties = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DeleterId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppPortfolioProjects", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppPortfolioSiteSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    Value = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    ValueType = table.Column<int>(type: "int", nullable: false),
                    IsPublic = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    ExtraProperties = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DeleterId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppPortfolioSiteSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppPortfolioSkills",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    Category = table.Column<int>(type: "int", nullable: false),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    ExtraProperties = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DeleterId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppPortfolioSkills", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppPortfolioExperienceHighlights",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PortfolioExperienceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppPortfolioExperienceHighlights", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppPortfolioExperienceHighlights_AppPortfolioExperiences_PortfolioExperienceId",
                        column: x => x.PortfolioExperienceId,
                        principalTable: "AppPortfolioExperiences",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AppPortfolioProjectTechnologies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PortfolioProjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppPortfolioProjectTechnologies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppPortfolioProjectTechnologies_AppPortfolioProjects_PortfolioProjectId",
                        column: x => x.PortfolioProjectId,
                        principalTable: "AppPortfolioProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppPortfolioContactMessages_Email",
                table: "AppPortfolioContactMessages",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_AppPortfolioContactMessages_IsArchived_IsRead_CreationTime",
                table: "AppPortfolioContactMessages",
                columns: new[] { "IsArchived", "IsRead", "CreationTime" });

            migrationBuilder.CreateIndex(
                name: "IX_AppPortfolioExperienceHighlights_PortfolioExperienceId_Text",
                table: "AppPortfolioExperienceHighlights",
                columns: new[] { "PortfolioExperienceId", "Text" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppPortfolioExperiences_IsActive_DisplayOrder",
                table: "AppPortfolioExperiences",
                columns: new[] { "IsActive", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_AppPortfolioExperiences_Type_IsDeleted",
                table: "AppPortfolioExperiences",
                columns: new[] { "Type", "IsDeleted" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppPortfolioProjects_IsActive_IsFeatured_DisplayOrder",
                table: "AppPortfolioProjects",
                columns: new[] { "IsActive", "IsFeatured", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_AppPortfolioProjects_Slug_IsDeleted",
                table: "AppPortfolioProjects",
                columns: new[] { "Slug", "IsDeleted" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppPortfolioProjectTechnologies_PortfolioProjectId_Name",
                table: "AppPortfolioProjectTechnologies",
                columns: new[] { "PortfolioProjectId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppPortfolioSiteSettings_IsPublic_IsActive_DisplayOrder",
                table: "AppPortfolioSiteSettings",
                columns: new[] { "IsPublic", "IsActive", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_AppPortfolioSiteSettings_Key_IsDeleted",
                table: "AppPortfolioSiteSettings",
                columns: new[] { "Key", "IsDeleted" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppPortfolioSkills_Category_Name_IsDeleted",
                table: "AppPortfolioSkills",
                columns: new[] { "Category", "Name", "IsDeleted" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppPortfolioSkills_IsActive_Category_DisplayOrder",
                table: "AppPortfolioSkills",
                columns: new[] { "IsActive", "Category", "DisplayOrder" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppPortfolioContactMessages");

            migrationBuilder.DropTable(
                name: "AppPortfolioExperienceHighlights");

            migrationBuilder.DropTable(
                name: "AppPortfolioProjectTechnologies");

            migrationBuilder.DropTable(
                name: "AppPortfolioSiteSettings");

            migrationBuilder.DropTable(
                name: "AppPortfolioSkills");

            migrationBuilder.DropTable(
                name: "AppPortfolioExperiences");

            migrationBuilder.DropTable(
                name: "AppPortfolioProjects");
        }
    }
}
