using System;
using System.Collections.Generic;
using System.Linq;
using Volo.Abp;
using Volo.Abp.DependencyInjection;

namespace kareem_fullstack_portfolio.Projects;

public class PortfolioProjectCaseStudyDefinitionProvider : IPortfolioProjectCaseStudyDefinitionProvider, ITransientDependency
{
    public IReadOnlyDictionary<string, PortfolioProjectCaseStudyDefinition> GetAll()
    {
        var definitions = GetDefinitions();

        foreach (var duplicateSlug in definitions
                     .GroupBy(definition => definition.Slug, StringComparer.OrdinalIgnoreCase)
                     .Where(group => group.Count() > 1)
                     .Select(group => group.Key))
        {
            throw new BusinessException(kareem_fullstack_portfolioDomainErrorCodes.PortfolioProjectCaseStudyDuplicateSlug)
                .WithData("Slug", duplicateSlug);
        }

        foreach (var definition in definitions)
        {
            definition.EnsureValid();
        }

        return definitions.ToDictionary(definition => definition.Slug, StringComparer.OrdinalIgnoreCase);
    }

    public PortfolioProjectCaseStudyDefinition? FindBySlug(string slug)
    {
        return GetAll().GetValueOrDefault(NormalizeSlug(slug));
    }

    public bool HasDefinition(string slug)
    {
        return GetAll().ContainsKey(NormalizeSlug(slug));
    }

    private static List<PortfolioProjectCaseStudyDefinition> GetDefinitions()
    {
        return
        [
            new(
                slug: "enterprise-erp-system",
                overview: "A business-oriented ERP case study focused on turning day-to-day company operations into secure modules, approval-aware workflows, and reporting-ready data contracts instead of disconnected screens.",
                businessProblem: "Growing operations need HR, permissions, reporting, and process control in one dependable system. Without a shared backend contract, business rules become inconsistent across modules and the product stops feeling like a serious internal platform.",
                solution: "The solution was shaped as a layered ASP.NET Core and ABP-style backend with Angular-ready application services. The backend owns validation, localized errors, permissions, and workflow-safe state handling so each module can evolve without duplicating business logic in the UI.",
                roleSummary: "I worked across the backend and frontend integration boundary, shaping entities, application services, permission-aware flows, and UI-facing contracts for business modules that need traceability and structured rules.",
                roleResponsibilities:
                [
                    "Designed backend contracts for secure module workflows and Angular consumption.",
                    "Implemented EF Core entities, application service logic, and reporting-friendly data structures.",
                    "Connected frontend screens to permission-aware APIs with clear state and visibility rules."
                ],
                keyFeatures:
                [
                    "Role-based permissions for protected business actions.",
                    "Workflow-oriented modules for approvals and operational tasks.",
                    "Reporting-aware data structures and query flows.",
                    "Authentication and authorization integrated into the product shape."
                ],
                architectureNotes:
                [
                    "The backend stays as the source of truth for permissions, validation, localization, and state transitions.",
                    "Application services expose Angular-ready DTOs so UI work remains presentation-focused.",
                    "Entity and service boundaries are organized to support future module growth instead of one-off feature code."
                ],
                highlightCards:
                [
                    new(
                        PortfolioProjectCaseStudyHighlightType.FrontendBackendIntegration,
                        "Angular screens backed by ASP.NET Core contracts",
                        "The ERP flow is shaped around Angular-ready DTOs and application-service endpoints so the UI presents business data without owning validation or workflow rules.",
                        1),
                    new(
                        PortfolioProjectCaseStudyHighlightType.RoleBasedSecurity,
                        "Backend-enforced security and permissions",
                        "Authentication and role-based permissions are handled in the backend, protecting sensitive actions and keeping visibility rules consistent across modules.",
                        2),
                    new(
                        PortfolioProjectCaseStudyHighlightType.ReportingAndData,
                        "Reporting-ready SQL Server and EF Core data",
                        "Entities and queries are prepared for operational reporting, traceability, and future dashboard metrics instead of one-off page responses.",
                        3),
                    new(
                        PortfolioProjectCaseStudyHighlightType.BusinessWorkflowAutomation,
                        "Business workflows with approval-aware state handling",
                        "The product thinking focuses on secure workflow execution for day-to-day operations, approvals, and business tasks that need dependable state transitions.",
                        4),
                    new(
                        PortfolioProjectCaseStudyHighlightType.AbpLayeredArchitecture,
                        "ABP-style layered architecture mindset",
                        "Routing, authorization, validation, and localized errors stay in the backend layers so future Angular expansion remains clean and maintainable.",
                        5)
                ],
                galleryItems:
                [
                    PortfolioProjectCaseStudyGalleryItemDefinition.Placeholder(
                        "ERP dashboard and module navigation",
                        "Placeholder for Angular screens that summarize module access, KPIs, and business navigation inside the ERP shell.",
                        1),
                    PortfolioProjectCaseStudyGalleryItemDefinition.Placeholder(
                        "Operational workflow screens",
                        "Placeholder for forms and list pages that demonstrate secure workflow execution across business modules.",
                        2)
                ],
                results:
                [
                    "Presents Kareem as someone who can build business systems with secure rules, not just demo pages.",
                    "Shows full-stack thinking across APIs, Angular integration, data modeling, and workflow-aware product behavior."
                ]),
            new(
                slug: "factory-to-customer-ecommerce-platform",
                overview: "An e-commerce platform positioned as a business system that connects factory-side inventory and pricing decisions with customer-facing purchasing journeys through stable backend contracts.",
                businessProblem: "Factories and customer ordering flows often drift apart when product, price, and order logic are handled in separate places. That creates friction for both administrators and customers and weakens trust in business data.",
                solution: "The product approach centers on backend-owned catalog, pricing, and order rules with application services ready for Angular storefront and admin experiences. This keeps operational data consistent while still allowing the frontend to present a polished buying flow.",
                roleSummary: "I focused on turning the commerce experience into a maintainable business platform by thinking through backend contracts, operational behavior, and the UI integration points required for both admin and customer journeys.",
                roleResponsibilities:
                [
                    "Modeled APIs and data contracts around product, pricing, and order workflow needs.",
                    "Prepared backend responses for frontend filtering, presentation, and transactional flows.",
                    "Framed the system as a business platform rather than a simple product listing demo."
                ],
                keyFeatures:
                [
                    "Catalog and pricing flows designed for operational consistency.",
                    "Order-oriented contracts that support customer and admin experiences.",
                    "Business-friendly API responses prepared for Angular rendering.",
                    "Clear separation between operational data ownership and storefront presentation."
                ],
                architectureNotes:
                [
                    "Backend contracts are shaped to support both public shopping experiences and business administration flows.",
                    "The solution emphasizes maintainable boundaries between pricing logic, catalog data, and UI presentation."
                ],
                highlightCards:
                [
                    new(
                        PortfolioProjectCaseStudyHighlightType.FrontendBackendIntegration,
                        "Storefront and admin flows share backend contracts",
                        "Catalog, pricing, and ordering behavior are prepared for both customer-facing Angular screens and internal administration tools.",
                        1),
                    new(
                        PortfolioProjectCaseStudyHighlightType.ReportingAndData,
                        "Operational data stays consistent across commerce flows",
                        "Backend-owned catalog and order rules keep factory-side data aligned with what customers see and buy.",
                        2)
                ],
                galleryItems:
                [
                    PortfolioProjectCaseStudyGalleryItemDefinition.Placeholder(
                        "Catalog and product browsing screens",
                        "Placeholder for storefront pages that display products, filters, and price-driven buying decisions.",
                        1)
                ],
                results:
                [
                    "Demonstrates product thinking across operational data, customer UX, and maintainable backend contracts.",
                    "Helps recruiters see commerce delivery as business workflow work, not only frontend styling."
                ]),
            new(
                slug: "cafeteria-system",
                overview: "A cafeteria operations system focused on practical internal workflows such as ordering, daily demand handling, and staff-facing execution without reducing the product to a lightweight toy example.",
                businessProblem: "Internal operations break down when daily demand, order handling, and staff coordination depend on informal processes. Teams need a system that supports routine execution and keeps operational data reliable.",
                solution: "The solution emphasizes clean backend contracts for internal workflows, with UI-ready responses that can support ordering screens, status views, and daily operational visibility in Angular.",
                roleSummary: "My role centered on designing the system as a usable business tool, making sure backend behavior, operational data, and frontend readiness all supported routine staff workflows.",
                roleResponsibilities:
                [
                    "Structured the product around realistic internal workflows and status-driven behavior.",
                    "Prepared service contracts for Angular pages that would support staff-facing execution.",
                    "Kept data and business rules consistent so the system remains dependable under daily use."
                ],
                keyFeatures:
                [
                    "Order and demand flows prepared for internal operations.",
                    "Status-aware data presentation for staff workflows.",
                    "Backend-driven contracts that reduce UI duplication of business logic."
                ],
                architectureNotes:
                [
                    "The system is shaped like an internal tool where reliability matters more than visual novelty.",
                    "Service responses are organized so future UI work can render workflows without owning the business rules."
                ],
                highlightCards:
                [
                    new(
                        PortfolioProjectCaseStudyHighlightType.BusinessWorkflowAutomation,
                        "Internal operations are treated as real workflows",
                        "Daily demand, order handling, and staff execution are modeled as dependable backend flows rather than ad-hoc UI states.",
                        1),
                    new(
                        PortfolioProjectCaseStudyHighlightType.FrontendBackendIntegration,
                        "Angular-ready contracts keep staff screens simple",
                        "The backend shapes the workflow state and data so future UI work can focus on usability and execution speed.",
                        2)
                ],
                galleryItems:
                [
                    PortfolioProjectCaseStudyGalleryItemDefinition.Placeholder(
                        "Daily operations and order tracking",
                        "Placeholder for staff-facing screens that show order queues, demand visibility, and workflow state.",
                        1)
                ],
                results:
                [
                    "Shows practical thinking for internal tools and operational reliability.",
                    "Supports the portfolio story that Kareem can model workflows beyond public marketing pages."
                ]),
            new(
                slug: "full-stack-portfolio-project",
                overview: "This portfolio platform treats project content as structured business case studies backed by application services, localization, and future admin-ready contracts rather than hardcoded frontend-only pages.",
                businessProblem: "A portfolio can undersell technical depth when projects are presented as simple cards with no structured explanation of backend design, business value, or implementation decisions.",
                solution: "The portfolio backend is designed so app services expose recruiter-focused content, localized enums, and backend-owned rules that future Angular pages can consume safely. That makes the site itself a proof point for product thinking and layered design.",
                roleSummary: "I designed the platform so the backend stays responsible for routes, DTO shape, localization, validation, and structured content definitions while the frontend remains focused on presentation and user experience.",
                roleResponsibilities:
                [
                    "Defined application-service contracts that are ready for Angular integration.",
                    "Structured portfolio content around business value, architecture, and case-study storytelling.",
                    "Kept backend localization and validation in the service layer instead of pushing rules into the UI."
                ],
                keyFeatures:
                [
                    "Project list and case-study endpoints shaped for recruiter-facing experiences.",
                    "Backend-owned localization for enums, labels, and business exceptions.",
                    "ABP-style routing and authorization conventions across public and admin-ready surfaces.",
                    "Definition-driven content that can evolve into content management later."
                ],
                architectureNotes:
                [
                    "Static portfolio content follows definition providers so business intent stays centralized in the backend.",
                    "App services remain the only API surface; no custom controllers are needed for project content.",
                    "Contracts are prepared for Angular conditional rendering through section metadata and structured collections."
                ],
                highlightCards:
                [
                    new(
                        PortfolioProjectCaseStudyHighlightType.AbpLayeredArchitecture,
                        "ABP-style app services stay the API surface",
                        "The project shows how routing, DTO contracts, validation, and authorization can stay in application services instead of custom controllers.",
                        1),
                    new(
                        PortfolioProjectCaseStudyHighlightType.FrontendBackendIntegration,
                        "Angular integration is prepared by backend contracts",
                        "Public pages can evolve safely because the backend exposes structured DTOs, localized labels, and conditional section metadata.",
                        2)
                ],
                galleryItems:
                [
                    PortfolioProjectCaseStudyGalleryItemDefinition.Placeholder(
                        "Projects list and details experience",
                        "Placeholder for the public portfolio pages that surface business-oriented project case studies.",
                        1)
                ],
                results:
                [
                    "Turns the portfolio itself into evidence of backend-first product design and Angular-ready API thinking.",
                    "Makes recruiter-facing content easier to scale without moving business rules into the frontend."
                ]),
            new(
                slug: "story-4-2-database-entities",
                overview: "This story focuses on the database foundation for the portfolio platform, translating business content and contact workflows into a clean EF Core Code First model that can support public experiences and future admin tooling.",
                businessProblem: "Without clear entities, common audited fields, and a stable persistence model, portfolio content becomes hard to evolve, contact submissions become fragile, and frontend work risks depending on database details instead of application contracts.",
                solution: "The solution models portfolio content with ABP-style entities, EF Core configurations, and SQL Server-ready conventions. Existing APIs remain DTO-based so Angular consumes clean contracts while the backend keeps ownership of validation, persistence, and future extension points.",
                roleSummary: "I owned the backend modeling slice of the feature by shaping the entities, deciding the shared fields, keeping the design maintainable, and making sure the database layer still supports real endpoints rather than fake content flows.",
                roleResponsibilities:
                [
                    "Mapped backlog requirements into EF Core entities that represent both public portfolio content and protected admin concerns.",
                    "Defined the shared audited and ordering fields so the schema stays consistent as more portfolio sections are added.",
                    "Kept the API boundary DTO-first so Angular consumes stable responses without leaking EF entities directly."
                ],
                keyFeatures:
                [
                    "Project: Stores recruiter-facing case study content, business summaries, visibility flags, and ordered technology references for each showcased build.",
                    "Skill: Keeps skill records grouped and publishable so the public site can render categorized strengths from real backend data.",
                    "Experience: Captures timeline-based experience content with room for highlights, ordering, and recruiter-readable storytelling.",
                    "ContactMessage: Persists validated contact submissions so inquiries are saved, reviewable, and ready for admin workflows.",
                    "SiteSetting: Holds configurable public portfolio settings such as brand copy, calls to action, and presentation-supporting values.",
                    "AdminUser: Covers the protected management surface needed for authenticated content operations without exposing internal access rules publicly."
                ],
                architectureNotes:
                [
                    "Common fields stay consistent across the model: Id, CreationTime, LastModificationTime, plus IsActive and DisplayOrder where they make sense.",
                    "Implementation follows EF Core Code First through ABP entities, configurations, DbContext setup, and DbMigrator-friendly conventions.",
                    "SQL Server remains the persistence target, while initial seed data gives the site real content from the first run.",
                    "Entities are never exposed directly from API responses; application services return DTOs that stay safe for Angular consumption.",
                    "The backend remains the source of truth for validation, visibility, business rules, and localized error behavior."
                ],
                highlightCards:
                [
                    new(
                        PortfolioProjectCaseStudyHighlightType.ReportingAndData,
                        "A simple entity map that still covers real product needs",
                        "The model handles projects, skills, experience, contact submissions, settings, and admin access without turning the schema into an overdesigned showcase.",
                        1),
                    new(
                        PortfolioProjectCaseStudyHighlightType.AbpLayeredArchitecture,
                        "Code First design aligned with ABP conventions",
                        "Entities, configurations, DbContext behavior, and seed data follow the layered structure expected by the rest of the solution.",
                        2),
                    new(
                        PortfolioProjectCaseStudyHighlightType.FrontendBackendIntegration,
                        "Existing endpoints stay DTO-first for Angular",
                        "The database work strengthens the current API surface instead of asking the frontend to fake data or depend on EF models directly.",
                        3),
                    new(
                        PortfolioProjectCaseStudyHighlightType.RoleBasedSecurity,
                        "Protected admin concerns remain backend-owned",
                        "Admin access, visibility rules, and future management flows stay on the backend side of the contract where they can be enforced consistently.",
                        4)
                ],
                galleryItems:
                [
                    PortfolioProjectCaseStudyGalleryItemDefinition.Placeholder(
                        "Entity boundaries and data ownership",
                        "Placeholder for visuals that explain how project, skill, experience, settings, and contact data are separated cleanly.",
                        1),
                    PortfolioProjectCaseStudyGalleryItemDefinition.Placeholder(
                        "DbContext and configuration structure",
                        "Placeholder for diagrams or screenshots showing how EF Core mappings are organized inside the portfolio backend.",
                        2)
                ],
                results:
                [
                    "EF Core entities exist for Project, Skill, Experience, ContactMessage, SiteSetting, and the admin access surface.",
                    "Entity configurations and DbContext structure keep SQL Server mapping simple, maintainable, and ready for growth.",
                    "Initial seed data supports a first-run experience without fake frontend placeholders.",
                    "Existing endpoints keep returning DTOs rather than exposing EF entities directly.",
                    "The database layer now supports responsive Angular pages with real backend content and clear ownership boundaries."
                ]),
            new(
                slug: "story-4-3-public-api-endpoints",
                overview: "This story turns the portfolio backend into a clean public API surface, exposing real project, skill, experience, site-setting, and contact capabilities through anonymous DTO-first endpoints that the Angular site can consume directly.",
                businessProblem: "A polished portfolio frontend loses credibility when public pages rely on hardcoded placeholders or when contact submission stops at the browser. The public site needs dependable endpoints that stay open for recruiters and clients without weakening backend ownership of validation or persistence.",
                solution: "The solution uses application-service endpoints for the public portfolio experience, keeping routes simple and anonymous where appropriate while the backend continues to own DTO shaping, validation, localized errors, and contact-message persistence. The Angular frontend can then stay focused on presentation, responsiveness, and bilingual UX instead of inventing fake data flows.",
                roleSummary: "I shaped the Story 4.3 slice around practical frontend consumption: expose the right anonymous endpoints, keep contracts predictable, and make sure the public contact workflow still lands in real backend storage with validation in place.",
                roleResponsibilities:
                [
                    "Mapped the portfolio pages to a concise public API surface that covers listing, details, supporting content, and contact submission.",
                    "Kept the application-service contracts DTO-first so Angular 21 pages can render real data without leaking entities or business rules into the UI.",
                    "Protected backend ownership of validation, message persistence, and localized endpoint behavior while keeping public reads frictionless."
                ],
                keyFeatures:
                [
                    "GET /api/projects: Returns the live public project list with filter-ready metadata and recruiter-facing summaries.",
                    "GET /api/projects/{slug}: Returns a structured case study for a single project so the frontend can render a detail page from real backend content.",
                    "GET /api/skills: Returns categorized skill groups that keep the public skills page backed by live backend data.",
                    "GET /api/experience: Returns the portfolio experience section with timeline items and highlight badges for the about page.",
                    "GET /api/site-settings: Returns public configuration values that support branded presentation without hardcoding them in Angular.",
                    "POST /api/contact: Accepts validated contact submissions and persists them in the database through backend-owned rules."
                ],
                architectureNotes:
                [
                    "Public endpoints stay anonymous by design so recruiters and clients can browse the portfolio without login friction.",
                    "Application services return DTOs only; Angular never depends on EF Core entities or persistence-specific details.",
                    "Contact submission validation remains backend-owned, including required fields, email validation, and spam-protection behavior.",
                    "Public content responses are ready for light mode, dark mode, English LTR, and Arabic RTL because the frontend consumes stable localized contracts.",
                    "Swagger should expose the public endpoints clearly so the API surface is easy to review during development and portfolio walkthroughs."
                ],
                highlightCards:
                [
                    new(
                        PortfolioProjectCaseStudyHighlightType.FrontendBackendIntegration,
                        "Live Angular consumption from public APIs",
                        "The public site can render projects, skills, experience, and settings directly from backend contracts instead of local placeholder data.",
                        1),
                    new(
                        PortfolioProjectCaseStudyHighlightType.AbpLayeredArchitecture,
                        "ABP-style application services as the API boundary",
                        "Routing, DTO shaping, validation, and anonymous access rules stay in the application layer rather than spreading into custom controllers or frontend logic.",
                        2),
                    new(
                        PortfolioProjectCaseStudyHighlightType.ReportingAndData,
                        "Public reads plus durable contact persistence",
                        "The story combines fast read endpoints with a write path that saves real contact messages in SQL-backed storage for future admin review.",
                        3),
                    new(
                        PortfolioProjectCaseStudyHighlightType.RoleBasedSecurity,
                        "Anonymous where public, protected where needed",
                        "The story keeps public content open while preserving the backend as the place where sensitive admin workflows and validation rules remain enforced.",
                        4)
                ],
                galleryItems:
                [
                    PortfolioProjectCaseStudyGalleryItemDefinition.Placeholder(
                        "Swagger and endpoint walkthrough",
                        "Placeholder for visuals that show the public portfolio endpoints grouped inside the API explorer.",
                        1),
                    PortfolioProjectCaseStudyGalleryItemDefinition.Placeholder(
                        "Angular pages consuming live endpoints",
                        "Placeholder for responsive public screens backed by projects, skills, experience, settings, and contact APIs.",
                        2)
                ],
                results:
                [
                    "The public projects endpoint works for the portfolio list experience.",
                    "The project-by-slug endpoint works for the case-study details experience.",
                    "The public skills endpoint works for the live skills matrix.",
                    "The public experience endpoint works for the about and timeline page.",
                    "The public site-settings endpoint works for branded presentation support.",
                    "The public contact endpoint validates required fields before accepting a submission.",
                    "The public contact endpoint saves contact messages in the database for later review.",
                    "Swagger exposes the public endpoints as part of the visible backend contract."
                ])
        ];
    }

    private static string NormalizeSlug(string? slug)
    {
        return slug.IsNullOrWhiteSpace()
            ? string.Empty
            : slug.Trim().ToLowerInvariant();
    }
}
