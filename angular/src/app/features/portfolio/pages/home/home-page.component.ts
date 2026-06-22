import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PortfolioProjectsService } from '@features/portfolio/services/portfolio-projects.service';
import { PortfolioSkillsService } from '@features/portfolio/services/portfolio-skills.service';
import { PortfolioExperienceService } from '@features/portfolio/services/portfolio-experience.service';
import { SiteSettingsService } from '@features/portfolio/services/site-settings.service';
import { trackById, trackBySlug } from '@core/utils/track-by.util';
import { SectionHeaderComponent } from '@shared/molecules/section-header.component';
import { StatCardComponent } from '@shared/components/stat-card.component';
import { ChipComponent } from '@shared/atoms/chip.component';
import { AuthCalloutComponent } from '@shared/auth/auth-callout.component';
import { ExperienceItem, Project, SiteSetting, Skill } from '@shared/models';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SectionHeaderComponent,
    StatCardComponent,
    ChipComponent,
    AuthCalloutComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero">
      <div class="hero__copy">
        <p class="hero__eyebrow">Full-stack portfolio</p>
        <h1>{{ headline() }}</h1>
        <p class="hero__body">
          I build production-facing Angular and ABP experiences with the same structure, maintainability,
          and delivery discipline expected in enterprise ERP products.
        </p>
        <div class="hero__actions">
          <a routerLink="/projects">Explore projects</a>
          <a routerLink="/contact" class="hero__ghost">Start a conversation</a>
        </div>
      </div>

      <div class="hero__sidebar">
        <div class="hero__stats">
          <app-stat-card label="Featured projects" [value]="featuredProjects().length.toString()" meta="Architecture, backend, and admin-first delivery" />
          <app-stat-card label="Core skills" [value]="featuredSkills().length.toString()" meta="Angular, ABP, .NET, and platform thinking" />
          <app-stat-card label="Availability" value="Open" [meta]="availability()" />
        </div>
        <app-auth-callout />
      </div>
    </section>

    <section class="content-grid">
      <article class="surface">
        <app-section-header
          eyebrow="Featured work"
          title="Projects with production-minded structure"
          description="These placeholders are wired through typed services and lazy routes so they can shift to real API-backed data without changing the page contracts."
        />
        <div class="cards">
          @for (project of featuredProjects(); track trackBySlug($index, project)) {
            <a class="project-card" [routerLink]="['/projects', project.slug]">
              <div class="project-card__header">
                <h3>{{ project.title }}</h3>
                <app-chip [label]="project.status" [tone]="project.status === 'Live' ? 'success' : project.status === 'InProgress' ? 'warning' : 'neutral'" />
              </div>
              <p>{{ project.summary }}</p>
              <div class="project-card__stack">
                @for (item of project.techStack; track item) {
                  <span>{{ item }}</span>
                }
              </div>
            </a>
          }
        </div>
      </article>

      <article class="surface">
        <app-section-header
          eyebrow="Capabilities"
          title="Reusable skills inventory"
          description="The portfolio keeps capabilities typed and presentation-ready so the admin workspace can manage them later from the same service contracts."
        />
        <div class="skills">
          @for (skill of featuredSkills(); track trackById($index, skill)) {
            <div class="skill-row">
              <div>
                <strong>{{ skill.name }}</strong>
                <span>{{ skill.category }}</span>
              </div>
              <app-chip [label]="skill.level" tone="neutral" />
            </div>
          }
        </div>
      </article>
    </section>

    <section class="surface">
      <app-section-header
        eyebrow="Experience"
        title="Delivery across product and platform work"
        description="A concise timeline for recruiters and clients, with room to expand later into richer portfolio storytelling."
      />
      <div class="timeline">
        @for (item of highlights(); track trackById($index, item)) {
          <div class="timeline__item">
            <div class="timeline__rail"></div>
            <div>
              <h3>{{ item.role }}</h3>
              <strong>{{ item.company }} · {{ item.location }}</strong>
              <p>{{ item.summary }}</p>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: grid;
        gap: 1.5rem;
      }

      .hero,
      .content-grid {
        display: grid;
        gap: 1.5rem;
      }

      .hero {
        grid-template-columns: 1.35fr minmax(320px, 0.85fr);
        align-items: start;
      }

      .hero__copy,
      .surface {
        border: 1px solid rgba(17, 50, 80, 0.08);
        border-radius: 1.5rem;
        background: rgba(255, 255, 255, 0.9);
        box-shadow: 0 30px 60px -42px rgba(15, 46, 74, 0.35);
      }

      .hero__copy {
        padding: clamp(1.5rem, 3vw, 2.4rem);
      }

      .hero__eyebrow {
        margin: 0 0 0.8rem;
        color: #6a7b90;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        font-size: 0.8rem;
      }

      h1 {
        margin: 0;
        color: #102538;
        font-size: clamp(2.4rem, 5vw, 4.2rem);
        line-height: 1.05;
      }

      .hero__body {
        margin: 1rem 0 0;
        max-width: 42rem;
        color: #5a6c84;
        line-height: 1.7;
        font-size: 1.05rem;
      }

      .hero__actions {
        display: flex;
        gap: 0.85rem;
        flex-wrap: wrap;
        margin-top: 1.5rem;
      }

      .hero__actions a {
        text-decoration: none;
        border-radius: 999px;
        padding: 0.95rem 1.2rem;
        background: #123b5c;
        color: #ffffff;
        font-weight: 600;
      }

      .hero__ghost {
        background: transparent !important;
        color: #123b5c !important;
        border: 1px solid #cbd7e4;
      }

      .hero__sidebar,
      .hero__stats,
      .cards,
      .skills,
      .timeline {
        display: grid;
        gap: 1rem;
      }

      .content-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .surface {
        padding: 1.4rem;
      }

      .project-card {
        display: grid;
        gap: 0.8rem;
        padding: 1.2rem;
        border-radius: 1.15rem;
        background: #f6f9fc;
        text-decoration: none;
      }

      .project-card__header {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: center;
      }

      .project-card h3,
      .timeline h3 {
        margin: 0;
        color: #132238;
      }

      .project-card p,
      .timeline p {
        margin: 0;
        color: #5f7088;
        line-height: 1.65;
      }

      .project-card__stack {
        display: flex;
        gap: 0.55rem;
        flex-wrap: wrap;
      }

      .project-card__stack span {
        border-radius: 999px;
        padding: 0.35rem 0.7rem;
        background: #e7edf5;
        color: #31506d;
        font-size: 0.8rem;
      }

      .skill-row,
      .timeline__item {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: start;
      }

      .skill-row strong {
        display: block;
        color: #15283b;
      }

      .skill-row span,
      .timeline strong {
        color: #66778f;
      }

      .timeline__rail {
        width: 0.8rem;
        min-width: 0.8rem;
        min-height: 100%;
        border-radius: 999px;
        background: linear-gradient(180deg, #123b5c 0%, #77abc9 100%);
      }

      @media (max-width: 1100px) {
        .hero,
        .content-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class HomePageComponent {
  readonly trackById = trackById;
  readonly trackBySlug = trackBySlug;
  private readonly settings = toSignal(inject(SiteSettingsService).getSiteSettings(), {
    initialValue: [] as SiteSetting[],
  });
  readonly featuredProjects = toSignal(inject(PortfolioProjectsService).getFeaturedProjects(), {
    initialValue: [] as Project[],
  });
  readonly featuredSkills = toSignal(inject(PortfolioSkillsService).getFeaturedSkills(), {
    initialValue: [] as Skill[],
  });
  readonly highlights = toSignal(inject(PortfolioExperienceService).getExperienceHighlights(), {
    initialValue: [] as ExperienceItem[],
  });

  readonly headline = computed(
    () => this.settings().find(setting => setting.key === 'headline')?.value ?? 'Full-Stack Engineer',
  );
  readonly availability = computed(
    () => this.settings().find(setting => setting.key === 'availability')?.value ?? '',
  );
}
