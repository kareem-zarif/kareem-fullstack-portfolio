import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { PublicThemeService } from '@core/services/public-theme.service';
import { getPortfolioCopy } from '@localization/index';
import {
  GetPortfolioProjectListInput,
  PortfolioProjectCard,
  PortfolioProjectList,
} from '@features/portfolio/models';
import { PortfolioProjectsApiService } from '@features/portfolio/services/portfolio-projects-api.service';
import { catchError, map, of, scan, startWith, switchMap } from 'rxjs';

interface ProjectsPageState {
  loading: boolean;
  error: boolean;
  data: PortfolioProjectList | null;
}

type ProjectsPageEvent =
  | { kind: 'loading' }
  | { kind: 'success'; data: PortfolioProjectList }
  | { kind: 'error' };

interface ProjectsMetric {
  value: string;
  label: string;
}

const INITIAL_STATE: ProjectsPageState = {
  loading: true,
  error: false,
  data: null,
};

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="projects-page">
      <section class="surface hero" aria-labelledby="projects-page-title">
        <div class="hero__copy">
          <p class="eyebrow">{{ copy().eyebrow }}</p>
          <h1 id="projects-page-title">{{ copy().title }}</h1>
          <p class="hero__summary">{{ copy().summary }}</p>

          <div class="hero__signals" [attr.aria-label]="copy().signalsLabel">
            <span>{{ copy().signalBusiness }}</span>
            <span>{{ copy().signalResponsive }}</span>
            <span>{{ copy().signalTheme }}</span>
          </div>

          <dl class="metrics-grid">
            @for (metric of metrics(); track metric.label) {
              <div class="metric-card">
                <dt>{{ metric.value }}</dt>
                <dd>{{ metric.label }}</dd>
              </div>
            }
          </dl>
        </div>

        <article class="spotlight-card">
          @if (featuredProject(); as featuredProject) {
            <div class="spotlight-card__header">
              <div class="spotlight-card__labels">
                <span class="eyebrow">{{ copy().featuredEyebrow }}</span>
                <strong>{{ featuredProject.projectTypeLabel }}</strong>
              </div>

              <span class="featured-badge">{{ copy().featuredBadge }}</span>
            </div>

            <h2>{{ featuredProject.title }}</h2>
            <p>{{ featuredProject.businessValuePreview }}</p>

            <div class="chip-row">
              @for (technology of featuredProject.techStack; track technology) {
                <span>{{ technology }}</span>
              }
            </div>

            <div class="spotlight-card__actions">
              @if (featuredProject.hasCaseStudyLink) {
                <a [routerLink]="projectRoute(featuredProject)" class="button button--primary">
                  {{ copy().viewCaseStudy }}
                </a>
              }

              @if (featuredProject.hasLiveDemoLink && featuredProject.liveDemoUrl) {
                <a
                  [href]="featuredProject.liveDemoUrl"
                  class="button button--secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ copy().viewLiveDemo }}
                </a>
              }
            </div>
          } @else {
            <div class="spotlight-card__labels">
              <span class="eyebrow">{{ copy().featuredEyebrow }}</span>
              <strong>{{ copy().emptyFeaturedTitle }}</strong>
            </div>

            <h2>{{ copy().emptyFeaturedTitle }}</h2>
            <p>{{ copy().emptyFeaturedDescription }}</p>
          }
        </article>
      </section>

      @if (pageState().error && !pageState().data) {
        <section class="state-card state-card--error" role="alert">
          <strong>{{ copy().errorTitle }}</strong>
          <p>{{ copy().errorDescription }}</p>
        </section>
      } @else {
        @if (pageState().error) {
          <section class="state-card state-card--warning" role="status">
            <strong>{{ copy().warningTitle }}</strong>
            <p>{{ copy().warningDescription }}</p>
          </section>
        }

        <section class="surface filters" [attr.aria-busy]="pageState().loading">
          <div class="filters__header">
            <div class="section-copy">
              <p class="eyebrow">{{ copy().filtersEyebrow }}</p>
              <h2>{{ copy().filtersTitle }}</h2>
              <p>{{ copy().filtersDescription }}</p>
            </div>

            <div class="filters__status">
              @if (pageState().loading) {
                <span class="loading-chip">
                  <span class="loading-chip__pulse"></span>
                  {{ copy().loadingInline }}
                </span>
              }

              <strong>{{ projects().length }} {{ copy().resultsLabel }}</strong>
            </div>
          </div>

          <div class="filters__controls">
            <label class="field">
              <span>{{ copy().projectTypeFieldLabel }}</span>
              <select [value]="selectedProjectType() ?? ''" (change)="setProjectType($any($event.target).value)">
                <option value="">{{ copy().allProjectTypesOption }}</option>
                @for (option of availableProjectTypes(); track option.value) {
                  <option [value]="option.value">{{ option.label }}</option>
                }
              </select>
            </label>

            <label class="field">
              <span>{{ copy().technologyFieldLabel }}</span>
              <select [value]="selectedTechnology() ?? ''" (change)="setTechnology($any($event.target).value)">
                <option value="">{{ copy().allTechnologiesOption }}</option>
                @for (technology of availableTechnologies(); track technology) {
                  <option [value]="technology">{{ technology }}</option>
                }
              </select>
            </label>

            <button type="button" class="button button--ghost" (click)="clearFilters()" [disabled]="!hasActiveFilters()">
              {{ copy().clearFilters }}
            </button>
          </div>

          <div class="active-filters">
            @if (activeFilters().length) {
              @for (filter of activeFilters(); track filter) {
                <span class="active-filters__chip">{{ filter }}</span>
              }
            } @else {
              <p>{{ copy().noActiveFilters }}</p>
            }
          </div>
        </section>

        @if (projects().length) {
          <section class="projects-grid" aria-labelledby="projects-grid-title">
            <h2 id="projects-grid-title" class="sr-only">{{ copy().gridTitle }}</h2>

            @for (project of projects(); track project.slug) {
              <article class="project-card" [class.project-card--featured]="project.isFeatured">
                <div class="project-card__header">
                  <div class="project-card__labels">
                    <span>{{ project.projectTypeLabel }}</span>
                    @if (project.isFeatured) {
                      <small>{{ copy().featuredBadge }}</small>
                    }
                  </div>

                  <div class="project-card__top-chips">
                    @if (project.hasCaseStudyLink) {
                      <span class="project-card__tag">{{ copy().caseStudyTag }}</span>
                    }
                  </div>
                </div>

                <div class="project-card__content">
                  <h3>{{ project.title }}</h3>
                  <p class="project-card__summary">{{ project.shortSummaryPreview }}</p>

                  <div class="project-card__value">
                    <strong>{{ copy().businessValueLabel }}</strong>
                    <p>{{ project.businessValuePreview }}</p>
                  </div>

                  <div class="chip-row" [attr.aria-label]="copy().techStackLabel">
                    @for (technology of project.techStack; track technology) {
                      <span>{{ technology }}</span>
                    }
                  </div>
                </div>

                <div class="project-card__actions">
                  @if (project.hasCaseStudyLink) {
                    <a [routerLink]="projectRoute(project)" class="button button--primary">
                      {{ copy().viewCaseStudy }}
                    </a>
                  }

                  @if (project.hasGitHubLink && project.gitHubUrl) {
                    <a [href]="project.gitHubUrl" class="button button--secondary" target="_blank" rel="noopener noreferrer">
                      {{ copy().viewGitHub }}
                    </a>
                  }

                  @if (project.hasLiveDemoLink && project.liveDemoUrl) {
                    <a [href]="project.liveDemoUrl" class="button button--ghost" target="_blank" rel="noopener noreferrer">
                      {{ copy().viewLiveDemo }}
                    </a>
                  }
                </div>
              </article>
            }
          </section>
        } @else if (!pageState().loading) {
          <section class="state-card state-card--empty" role="status">
            <strong>{{ copy().emptyTitle }}</strong>
            <p>{{ copy().emptyDescription }}</p>
            <button type="button" class="button button--primary" (click)="clearFilters()">
              {{ copy().clearFilters }}
            </button>
          </section>
        }
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        border: 0;
      }

      .projects-page {
        display: grid;
        gap: clamp(1.25rem, 2.8vw, 2rem);
        padding-block: clamp(0.5rem, 2vw, 1rem) clamp(1rem, 2.5vw, 1.5rem);
      }

      .surface,
      .state-card {
        position: relative;
        overflow: hidden;
        display: grid;
        gap: 1.5rem;
        padding: clamp(1.25rem, 3.5vw, 2.35rem);
        border: 1px solid var(--portfolio-border);
        border-radius: 2rem;
        background: color-mix(in srgb, var(--portfolio-bg-elevated) 92%, transparent);
        box-shadow: var(--portfolio-shadow);
      }

      .hero {
        display: grid;
        grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
        gap: clamp(1.2rem, 3vw, 2rem);
        align-items: stretch;
        min-height: min(720px, calc(100vh - 9rem));
      }

      .hero__copy,
      .spotlight-card,
      .section-copy,
      .project-card,
      .project-card__content,
      .project-card__value,
      .field,
      .state-card {
        display: grid;
        gap: 1rem;
      }

      .hero__copy {
        align-content: center;
      }

      .eyebrow {
        margin: 0;
        color: var(--portfolio-accent);
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }

      h1,
      h2,
      h3,
      p,
      dl,
      dt,
      dd,
      strong {
        margin: 0;
      }

      h1,
      h2,
      h3,
      strong {
        color: var(--portfolio-text);
        text-wrap: balance;
      }

      p,
      dd,
      select,
      .filters__status span,
      .filters__status strong {
        color: var(--portfolio-muted);
        line-height: 1.7;
      }

      h1 {
        max-width: 11ch;
        font-size: clamp(2.5rem, 6.2vw, 5.4rem);
        line-height: 0.95;
      }

      .hero__summary {
        max-width: 58rem;
        font-size: clamp(1rem, 1.6vw, 1.12rem);
      }

      .hero__signals,
      .chip-row,
      .project-card__actions,
      .spotlight-card__actions,
      .filters__controls,
      .active-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 0.8rem;
      }

      .hero__signals span,
      .chip-row span,
      .active-filters__chip,
      .project-card__tag,
      .loading-chip,
      .featured-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--portfolio-border);
        border-radius: 999px;
        padding: 0.48rem 0.82rem;
        background: color-mix(in srgb, var(--portfolio-bg-soft) 78%, transparent);
        color: var(--portfolio-text);
        font-size: 0.82rem;
        font-weight: 700;
        text-align: center;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.85rem;
      }

      .metric-card {
        padding: 1rem 1.05rem;
        border: 1px solid var(--portfolio-border);
        border-radius: 1.35rem;
        background: color-mix(in srgb, var(--portfolio-bg) 68%, transparent);
      }

      .metric-card dt {
        color: var(--portfolio-text);
        font-size: clamp(1.35rem, 2.7vw, 2rem);
        font-weight: 800;
      }

      .metric-card dd {
        margin-block-start: 0.25rem;
        font-size: 0.88rem;
      }

      .spotlight-card {
        align-content: center;
        padding: 1.35rem;
        border: 1px solid var(--portfolio-border);
        border-radius: 1.7rem;
        background:
          linear-gradient(
            145deg,
            color-mix(in srgb, var(--portfolio-primary) 16%, transparent),
            transparent 58%
          ),
          color-mix(in srgb, var(--portfolio-bg-elevated) 84%, transparent);
        backdrop-filter: blur(14px);
      }

      .spotlight-card__header,
      .project-card__header,
      .filters__header {
        display: flex;
        align-items: start;
        justify-content: space-between;
        gap: 1rem;
      }

      .spotlight-card__labels,
      .project-card__labels {
        display: grid;
        gap: 0.35rem;
      }

      .spotlight-card__labels strong,
      .project-card__labels span,
      .project-card__labels small {
        color: var(--portfolio-primary);
        font-size: 0.82rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .featured-badge {
        border-color: color-mix(in srgb, var(--portfolio-primary) 24%, var(--portfolio-border));
        background: color-mix(in srgb, var(--portfolio-primary) 10%, transparent);
        color: var(--portfolio-primary);
      }

      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
        min-height: 3rem;
        border: 1px solid transparent;
        border-radius: 999px;
        padding: 0.82rem 1.15rem;
        font-weight: 800;
        text-decoration: none;
        cursor: pointer;
        transition:
          transform 180ms ease,
          border-color 180ms ease,
          background 180ms ease,
          color 180ms ease,
          opacity 180ms ease;
      }

      .button:hover,
      .button:focus-visible {
        transform: translateY(-2px);
      }

      .button:disabled {
        cursor: not-allowed;
        opacity: 0.55;
        transform: none;
      }

      .button--primary {
        background: linear-gradient(
          135deg,
          var(--portfolio-primary),
          color-mix(in srgb, var(--portfolio-primary) 68%, var(--portfolio-accent))
        );
        color: var(--portfolio-primary-contrast);
      }

      .button--secondary {
        border-color: color-mix(in srgb, var(--portfolio-primary) 24%, var(--portfolio-border));
        background: color-mix(in srgb, var(--portfolio-primary) 9%, transparent);
        color: var(--portfolio-primary);
      }

      .button--ghost {
        border-color: var(--portfolio-border);
        background: transparent;
        color: var(--portfolio-text);
      }

      .filters {
        gap: 1.4rem;
      }

      .filters__status {
        display: grid;
        gap: 0.75rem;
        justify-items: end;
      }

      .filters__status strong {
        color: var(--portfolio-text);
        font-size: 0.95rem;
      }

      .field span {
        color: var(--portfolio-text);
        font-size: 0.88rem;
        font-weight: 700;
      }

      select {
        width: 100%;
        min-width: 0;
        border: 1px solid var(--portfolio-border);
        border-radius: 1.1rem;
        padding: 0.92rem 1rem;
        background: color-mix(in srgb, var(--portfolio-bg-soft) 84%, transparent);
        outline: none;
        transition:
          border-color 180ms ease,
          box-shadow 180ms ease,
          background 180ms ease;
      }

      select:focus-visible {
        border-color: color-mix(in srgb, var(--portfolio-primary) 44%, var(--portfolio-border));
        box-shadow: 0 0 0 0.22rem color-mix(in srgb, var(--portfolio-primary) 16%, transparent);
      }

      .field {
        flex: 1 1 16rem;
      }

      .loading-chip {
        gap: 0.55rem;
      }

      .loading-chip__pulse {
        width: 0.7rem;
        height: 0.7rem;
        border-radius: 999px;
        background: var(--portfolio-primary);
        box-shadow: 0 0 0 0 color-mix(in srgb, var(--portfolio-primary) 26%, transparent);
        animation: portfolio-pulse 1.2s ease-in-out infinite;
      }

      .active-filters p {
        color: var(--portfolio-muted);
      }

      .projects-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1rem;
      }

      .project-card {
        padding: 1.3rem;
        border: 1px solid var(--portfolio-border);
        border-radius: 1.6rem;
        background: color-mix(in srgb, var(--portfolio-bg-soft) 80%, transparent);
        box-shadow: 0 18px 42px -34px color-mix(in srgb, var(--portfolio-primary) 26%, transparent);
      }

      .project-card--featured {
        background:
          linear-gradient(
            150deg,
            color-mix(in srgb, var(--portfolio-primary) 14%, transparent),
            transparent 58%
          ),
          color-mix(in srgb, var(--portfolio-bg-soft) 82%, transparent);
      }

      .project-card__top-chips {
        display: flex;
        flex-wrap: wrap;
        justify-content: end;
        gap: 0.5rem;
      }

      .project-card__tag {
        border-color: color-mix(in srgb, var(--portfolio-accent) 26%, var(--portfolio-border));
        background: color-mix(in srgb, var(--portfolio-accent) 12%, transparent);
        color: var(--portfolio-accent);
      }

      .project-card h3 {
        font-size: 1.35rem;
        line-height: 1.2;
        display: -webkit-box;
        overflow: hidden;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }

      .project-card__summary,
      .project-card__value p {
        display: -webkit-box;
        overflow: hidden;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
      }

      .project-card__summary {
        min-height: 5.4rem;
      }

      .project-card__value {
        padding: 1rem;
        border: 1px solid var(--portfolio-border);
        border-radius: 1.2rem;
        background: color-mix(in srgb, var(--portfolio-bg) 72%, transparent);
      }

      .project-card__value strong {
        color: var(--portfolio-text);
        font-size: 0.85rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .project-card__actions {
        margin-top: auto;
      }

      .state-card {
        min-height: 15rem;
        place-items: center;
        text-align: center;
      }

      .state-card strong {
        font-size: 1.2rem;
      }

      .state-card--warning {
        min-height: auto;
        text-align: start;
        place-items: start;
        border-style: dashed;
      }

      .state-card--error {
        border-color: color-mix(in srgb, #c94d4d 34%, var(--portfolio-border));
      }

      @keyframes portfolio-pulse {
        0%,
        100% {
          transform: scale(0.92);
          box-shadow: 0 0 0 0 color-mix(in srgb, var(--portfolio-primary) 26%, transparent);
        }
        50% {
          transform: scale(1);
          box-shadow: 0 0 0 0.45rem color-mix(in srgb, var(--portfolio-primary) 0%, transparent);
        }
      }

      @media (prefers-reduced-motion: no-preference) {
        .surface,
        .state-card {
          animation: surface-rise 420ms ease both;
        }

        .project-card,
        .metric-card,
        .spotlight-card {
          animation: card-rise 520ms ease both;
        }

        @keyframes surface-rise {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes card-rise {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      }

      @media (max-width: 1180px) {
        .hero,
        .projects-grid {
          grid-template-columns: 1fr;
        }

        .hero {
          min-height: auto;
        }
      }

      @media (max-width: 900px) {
        .metrics-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 760px) {
        .filters__header,
        .project-card__header {
          flex-direction: column;
        }

        .filters__status {
          justify-items: start;
        }

        .button {
          flex: 1 1 100%;
        }
      }

      @media (max-width: 640px) {
        .surface,
        .state-card {
          border-radius: 1.5rem;
        }

        .spotlight-card,
        .project-card,
        .metric-card,
        select,
        .project-card__value {
          border-radius: 1.2rem;
        }

        h1 {
          max-width: none;
        }

        .hero__signals span,
        .chip-row span,
        .active-filters__chip,
        .loading-chip,
        .featured-badge,
        .project-card__tag {
          width: 100%;
        }
      }
    `,
  ],
})
export class ProjectsPageComponent {
  private readonly theme = inject(PublicThemeService);
  private readonly projectsApi = inject(PortfolioProjectsApiService);

  readonly copy = computed(() => getPortfolioCopy(this.theme.language(), 'projectsPage'));
  readonly selectedProjectType = signal<number | null>(null);
  readonly selectedTechnology = signal<string | null>(null);

  private readonly requestFilters = computed<GetPortfolioProjectListInput>(() => ({
    projectType: this.selectedProjectType(),
    technology: this.selectedTechnology(),
  }));

  readonly pageState = toSignal(
    toObservable(this.requestFilters).pipe(
      switchMap(filters =>
        this.projectsApi.getProjectList(filters).pipe(
          map(data => ({ kind: 'success', data }) satisfies ProjectsPageEvent),
          startWith({ kind: 'loading' } satisfies ProjectsPageEvent),
          catchError(() => of({ kind: 'error' } satisfies ProjectsPageEvent)),
        ),
      ),
      scan((state: ProjectsPageState, event: ProjectsPageEvent) => {
        switch (event.kind) {
          case 'loading':
            return {
              ...state,
              loading: true,
              error: false,
            };
          case 'success':
            return {
              loading: false,
              error: false,
              data: event.data,
            };
          case 'error':
            return {
              ...state,
              loading: false,
              error: true,
            };
        }
      }, INITIAL_STATE),
      startWith(INITIAL_STATE),
    ),
    { initialValue: INITIAL_STATE },
  );

  readonly projects = computed(() => this.pageState().data?.items ?? []);
  readonly availableProjectTypes = computed(() => this.pageState().data?.availableProjectTypes ?? []);
  readonly availableTechnologies = computed(() => this.pageState().data?.availableTechnologies ?? []);
  readonly featuredProject = computed(() => this.projects().find(project => project.isFeatured) ?? this.projects()[0] ?? null);
  readonly hasActiveFilters = computed(() => this.selectedProjectType() !== null || this.selectedTechnology() !== null);

  readonly activeFilters = computed(() => {
    const filters: string[] = [];
    const selectedType = this.selectedProjectType();
    const selectedTechnology = this.selectedTechnology();

    if (selectedType !== null) {
      const option = this.availableProjectTypes().find(item => item.value === selectedType);
      filters.push(option?.label ?? String(selectedType));
    }

    if (selectedTechnology) {
      filters.push(selectedTechnology);
    }

    return filters;
  });

  readonly metrics = computed<ProjectsMetric[]>(() => {
    const data = this.pageState().data;

    return [
      {
        value: this.formatMetric(data?.items.length ?? 0),
        label: this.copy().metricProjects,
      },
      {
        value: this.formatMetric(data?.availableProjectTypes.length ?? 0),
        label: this.copy().metricTypes,
      },
      {
        value: this.formatMetric(data?.availableTechnologies.length ?? 0),
        label: this.copy().metricTechnologies,
      },
    ];
  });

  setProjectType(value: string): void {
    const parsedValue = Number(value);
    this.selectedProjectType.set(Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null);
  }

  setTechnology(value: string): void {
    const normalizedValue = value.trim();
    this.selectedTechnology.set(normalizedValue ? normalizedValue : null);
  }

  clearFilters(): void {
    this.selectedProjectType.set(null);
    this.selectedTechnology.set(null);
  }

  projectRoute(project: PortfolioProjectCard): string {
    return project.caseStudyRoute || `/projects/${project.slug}`;
  }

  private formatMetric(value: number): string {
    return String(value).padStart(2, '0');
  }
}
