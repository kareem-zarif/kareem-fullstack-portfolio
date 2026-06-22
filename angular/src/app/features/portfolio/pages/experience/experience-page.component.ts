import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  PortfolioCallToAction,
  PortfolioCallToActionType,
  PortfolioExperienceSection,
  PortfolioExperienceTimelineItem,
  PortfolioIdentity,
} from '@features/portfolio/models';
import { PortfolioExperienceApiService } from '@features/portfolio/services/portfolio-experience-api.service';
import { PortfolioHomePageApiService } from '@features/portfolio/services/portfolio-home-page-api.service';
import { getPortfolioCopy } from '@localization/index';
import { PublicThemeService } from '@core/services/public-theme.service';
import { catchError, combineLatest, map, of, startWith } from 'rxjs';

interface ExperiencePageState {
  loading: boolean;
  experience: PortfolioExperienceSection | null;
  identity: PortfolioIdentity | null;
}

interface ExperienceMetric {
  value: string;
  label: string;
}

@Component({
  selector: 'app-experience-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (pageState().loading) {
      <section class="page-state" aria-live="polite">
        <span class="page-state__pulse"></span>
        <p>{{ copy().loading }}</p>
      </section>
    } @else if (!pageState().experience) {
      <section class="page-state page-state--error" role="alert">
        <strong>{{ copy().errorTitle }}</strong>
        <p>{{ copy().errorDescription }}</p>
      </section>
    } @else if (pageState().experience; as experience) {
      <div class="experience-page">
        <section class="surface hero" aria-labelledby="experience-page-title">
          <div class="hero__copy">
            <p class="eyebrow">{{ copy().eyebrow }}</p>
            <h1 id="experience-page-title">{{ experience.headline || copy().fallbackHeadline }}</h1>
            <p class="hero__summary">{{ experience.summary || copy().fallbackSummary }}</p>

            @if (pageState().identity; as identity) {
              <article class="about-card">
                <div class="about-card__header">
                  <span class="eyebrow">{{ copy().aboutEyebrow }}</span>
                  <strong>{{ identity.professionalTitle }}</strong>
                </div>

                <h2>{{ identity.mainMessage }}</h2>
                <p>{{ identity.businessSummary }}</p>

                @if (identity.targetAudiences.length) {
                  <div class="pill-row" [attr.aria-label]="copy().targetAudiencesLabel">
                    @for (audience of identity.targetAudiences; track audience.type) {
                      <span>{{ audience.label }}</span>
                    }
                  </div>
                }
              </article>
            }

            <div class="hero__highlights">
              <div class="section-copy">
                <p class="eyebrow">{{ copy().highlightsEyebrow }}</p>
                <h2>{{ copy().highlightsTitle }}</h2>
                <p>{{ copy().highlightsDescription }}</p>
              </div>

              <div class="pill-row" [attr.aria-label]="copy().experienceHighlightsLabel">
                @for (badge of experience.highlightBadges; track badge.type) {
                  <span>{{ badge.label }}</span>
                }
              </div>
            </div>
          </div>

          <div class="hero__aside">
            <article class="summary-card">
              <div class="section-copy">
                <p class="eyebrow">{{ copy().summaryEyebrow }}</p>
                <h2>{{ pageState().identity?.fullName || 'Kareem Zarif' }}</h2>
                <p>{{ pageState().identity?.businessSummary || copy().fallbackSummary }}</p>
              </div>

              <dl class="metrics-grid">
                @for (metric of metrics(); track metric.label) {
                  <div class="metric-card">
                    <dt>{{ metric.value }}</dt>
                    <dd>{{ metric.label }}</dd>
                  </div>
                }
              </dl>

              @if (primaryExperience(); as item) {
                <article class="primary-card">
                  <div class="primary-card__header">
                    <span>{{ item.typeLabel }}</span>
                    <small>{{ copy().primaryFlag }}</small>
                  </div>
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.businessValue }}</p>
                </article>
              }
            </article>

            <article class="actions-card">
              <div class="section-copy">
                <p class="eyebrow">{{ copy().actionsEyebrow }}</p>
                <h2>{{ pageState().identity?.fullName || 'Kareem Zarif' }}</h2>
              </div>

              <div class="actions-card__buttons">
                @for (action of featuredActions(); track action.type) {
                  @if (isRouterAction(action)) {
                    <a [routerLink]="action.url" [class]="ctaClass(action)">
                      <i [class]="actionIcon(action.type)"></i>
                      <span>{{ action.label }}</span>
                    </a>
                  } @else {
                    <a
                      [href]="action.url"
                      [class]="ctaClass(action)"
                      [attr.target]="action.isExternal ? '_blank' : null"
                      [attr.rel]="action.isExternal ? 'noopener noreferrer' : null"
                      [attr.download]="isDownloadAction(action) ? '' : null"
                    >
                      <i [class]="actionIcon(action.type)"></i>
                      <span>{{ action.label }}</span>
                    </a>
                  }
                }
              </div>
            </article>
          </div>
        </section>

        <section class="surface timeline-section" aria-labelledby="career-timeline-title">
          <div class="section-copy section-copy--wide">
            <p class="eyebrow">{{ copy().timelineEyebrow }}</p>
            <h2 id="career-timeline-title">{{ copy().timelineTitle }}</h2>
            <p>{{ copy().timelineDescription }}</p>
          </div>

          <div class="timeline-grid">
            @for (item of experience.timelineItems; track item.type) {
              <article class="timeline-card" [class.timeline-card--primary]="item.isPrimaryProfessionalExperience">
                <div class="timeline-card__index">{{ formatMetric(item.displayOrder) }}</div>

                <div class="timeline-card__body">
                  <div class="timeline-card__header">
                    <div class="timeline-card__eyebrows">
                      <span>{{ item.stageLabel }}</span>
                      <small>{{ item.typeLabel }}</small>
                    </div>

                    @if (item.isPrimaryProfessionalExperience) {
                      <strong class="timeline-card__flag">{{ copy().primaryFlag }}</strong>
                    }
                  </div>

                  <div class="timeline-card__title-block">
                    <h3>{{ item.title }}</h3>
                    <p>{{ item.organization }}</p>
                  </div>

                  <p>{{ item.summary }}</p>

                  <div class="timeline-card__value">
                    <strong>{{ copy().businessValueLabel }}</strong>
                    <p>{{ item.businessValue }}</p>
                  </div>

                  <div class="pill-row" [attr.aria-label]="copy().experienceHighlightsLabel">
                    @for (highlight of item.highlights; track highlight) {
                      <span>{{ highlight }}</span>
                    }
                  </div>
                </div>
              </article>
            }
          </div>
        </section>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .experience-page {
        display: grid;
        gap: clamp(1.25rem, 2.8vw, 2rem);
        padding-block: clamp(0.5rem, 2vw, 1rem) clamp(1rem, 2.5vw, 1.5rem);
      }

      .surface,
      .page-state {
        position: relative;
        overflow: hidden;
        display: grid;
        gap: 1.5rem;
        padding: clamp(1.25rem, 3.5vw, 2.4rem);
        border: 1px solid var(--portfolio-border);
        border-radius: 2rem;
        background: color-mix(in srgb, var(--portfolio-bg-elevated) 92%, transparent);
        box-shadow: var(--portfolio-shadow);
      }

      .hero {
        display: grid;
        grid-template-columns: minmax(0, 1.05fr) minmax(300px, 0.95fr);
        gap: clamp(1.2rem, 3vw, 2rem);
        align-items: start;
      }

      .hero__copy,
      .hero__aside,
      .about-card,
      .summary-card,
      .actions-card,
      .primary-card,
      .timeline-card__body,
      .section-copy {
        display: grid;
        gap: 1rem;
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
      dd {
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
      small,
      .timeline-card__eyebrows span,
      .timeline-card__eyebrows small {
        color: var(--portfolio-muted);
        line-height: 1.7;
      }

      h1 {
        max-width: 13ch;
        font-size: clamp(2.45rem, 6.4vw, 5.25rem);
        line-height: 0.96;
      }

      .hero__summary {
        max-width: 55rem;
        font-size: clamp(1rem, 1.6vw, 1.12rem);
      }

      .about-card,
      .summary-card,
      .actions-card,
      .timeline-card,
      .primary-card {
        padding: 1.3rem;
        border: 1px solid var(--portfolio-border);
        border-radius: 1.6rem;
        background: color-mix(in srgb, var(--portfolio-bg-soft) 78%, transparent);
      }

      .about-card__header,
      .timeline-card__header,
      .primary-card__header {
        display: flex;
        align-items: start;
        justify-content: space-between;
        gap: 0.9rem;
      }

      .about-card__header strong,
      .primary-card__header span,
      .timeline-card__flag {
        color: var(--portfolio-primary);
        font-size: 0.88rem;
        font-weight: 800;
      }

      .hero__highlights {
        display: grid;
        gap: 1rem;
      }

      .pill-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.7rem;
      }

      .pill-row span {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--portfolio-border);
        border-radius: 999px;
        padding: 0.48rem 0.8rem;
        background: color-mix(in srgb, var(--portfolio-bg-soft) 76%, transparent);
        color: var(--portfolio-text);
        font-size: 0.84rem;
        font-weight: 700;
        text-align: center;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.85rem;
      }

      .metric-card {
        padding: 1rem;
        border: 1px solid var(--portfolio-border);
        border-radius: 1.3rem;
        background: color-mix(in srgb, var(--portfolio-bg) 64%, transparent);
      }

      .metric-card dt {
        color: var(--portfolio-text);
        font-size: clamp(1.2rem, 2.5vw, 1.8rem);
        font-weight: 800;
      }

      .metric-card dd {
        margin-block-start: 0.25rem;
        font-size: 0.88rem;
      }

      .primary-card {
        background:
          linear-gradient(
            145deg,
            color-mix(in srgb, var(--portfolio-primary) 14%, transparent),
            transparent 60%
          ),
          color-mix(in srgb, var(--portfolio-bg-soft) 84%, transparent);
      }

      .primary-card__header small {
        color: var(--portfolio-accent);
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .actions-card__buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 0.8rem;
      }

      .cta {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
        min-height: 3rem;
        border-radius: 999px;
        padding: 0.82rem 1.15rem;
        text-decoration: none;
        font-weight: 800;
        transition:
          transform 180ms ease,
          border-color 180ms ease,
          background 180ms ease,
          color 180ms ease;
      }

      .cta:hover,
      .cta:focus-visible {
        transform: translateY(-2px);
      }

      .cta--primary {
        border: 1px solid transparent;
        background: linear-gradient(
          135deg,
          var(--portfolio-primary),
          color-mix(in srgb, var(--portfolio-primary) 68%, var(--portfolio-accent))
        );
        color: var(--portfolio-primary-contrast);
      }

      .cta--secondary {
        border: 1px solid var(--portfolio-border);
        background: transparent;
        color: var(--portfolio-text);
      }

      .cta--link {
        border: 1px solid color-mix(in srgb, var(--portfolio-primary) 22%, var(--portfolio-border));
        background: color-mix(in srgb, var(--portfolio-primary) 9%, transparent);
        color: var(--portfolio-primary);
      }

      .timeline-section {
        gap: 1.4rem;
      }

      .section-copy--wide {
        max-width: 60rem;
      }

      .timeline-grid {
        position: relative;
        display: grid;
        gap: 1rem;
      }

      .timeline-grid::before {
        content: '';
        position: absolute;
        inset-block: 0;
        inset-inline-start: 1.25rem;
        width: 2px;
        background: linear-gradient(
          180deg,
          color-mix(in srgb, var(--portfolio-primary) 55%, transparent),
          color-mix(in srgb, var(--portfolio-accent) 55%, transparent)
        );
      }

      .timeline-card {
        position: relative;
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        gap: 1rem;
        background: color-mix(in srgb, var(--portfolio-bg-soft) 74%, transparent);
      }

      .timeline-card--primary {
        background:
          linear-gradient(
            145deg,
            color-mix(in srgb, var(--portfolio-primary) 16%, transparent),
            transparent 56%
          ),
          color-mix(in srgb, var(--portfolio-bg-soft) 80%, transparent);
      }

      .timeline-card__index {
        position: relative;
        z-index: 1;
        display: grid;
        place-items: center;
        width: 2.5rem;
        height: 2.5rem;
        margin-block-start: 0.15rem;
        border-radius: 999px;
        background: linear-gradient(135deg, var(--portfolio-primary), var(--portfolio-accent));
        color: var(--portfolio-primary-contrast);
        font-weight: 900;
        box-shadow: 0 18px 40px -26px color-mix(in srgb, var(--portfolio-primary) 80%, transparent);
      }

      .timeline-card__eyebrows {
        display: grid;
        gap: 0.18rem;
      }

      .timeline-card__title-block {
        display: grid;
        gap: 0.35rem;
      }

      .timeline-card__title-block p {
        font-size: 0.92rem;
      }

      .timeline-card__value {
        padding: 0.95rem 1rem;
        border-radius: 1.1rem;
        background: color-mix(in srgb, var(--portfolio-bg) 68%, transparent);
      }

      .timeline-card__value strong {
        display: block;
        margin-block-end: 0.3rem;
      }

      .page-state {
        min-height: 18rem;
        place-items: center;
        text-align: center;
      }

      .page-state strong {
        font-size: 1.2rem;
      }

      .page-state__pulse {
        width: 3rem;
        height: 3rem;
        border-radius: 999px;
        border: 0.35rem solid color-mix(in srgb, var(--portfolio-accent) 25%, transparent);
        border-block-start-color: var(--portfolio-primary);
        animation: portfolio-spin 900ms linear infinite;
      }

      @keyframes portfolio-spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (prefers-reduced-motion: no-preference) {
        .surface,
        .page-state {
          animation: surface-rise 420ms ease both;
        }

        .about-card,
        .summary-card,
        .actions-card,
        .timeline-card,
        .metric-card,
        .primary-card {
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
        .hero {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 900px) {
        .metrics-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 720px) {
        .timeline-grid::before {
          inset-inline-start: 1.1rem;
        }

        .actions-card__buttons a {
          flex: 1 1 100%;
        }
      }

      @media (max-width: 640px) {
        .surface,
        .page-state {
          border-radius: 1.5rem;
        }

        .about-card,
        .summary-card,
        .actions-card,
        .timeline-card,
        .primary-card,
        .metric-card {
          border-radius: 1.25rem;
        }

        h1 {
          max-width: none;
        }

        .pill-row span {
          width: 100%;
        }

        .timeline-card {
          grid-template-columns: 1fr;
        }

        .timeline-grid::before {
          display: none;
        }
      }
    `,
  ],
})
export class ExperiencePageComponent {
  private readonly theme = inject(PublicThemeService);
  private readonly experienceApi = inject(PortfolioExperienceApiService);
  private readonly homePageApi = inject(PortfolioHomePageApiService);

  readonly copy = computed(() => getPortfolioCopy(this.theme.language(), 'experiencePage'));

  readonly pageState = toSignal(
    combineLatest({
      experience: this.experienceApi.getExperienceSection().pipe(
        map(data => ({ data, error: false })),
        catchError(() => of({ data: null, error: true })),
      ),
      identity: this.homePageApi.getIdentity().pipe(catchError(() => of(null))),
    }).pipe(
      map(({ experience, identity }) => ({
        loading: false,
        experience: experience.data,
        identity,
      })),
      startWith({
        loading: true,
        experience: null,
        identity: null,
      }),
    ),
    {
      initialValue: {
        loading: true,
        experience: null,
        identity: null,
      } satisfies ExperiencePageState,
    },
  );

  readonly primaryExperience = computed<PortfolioExperienceTimelineItem | null>(() => {
    const items = this.pageState().experience?.timelineItems ?? [];
    return items.find(item => item.isPrimaryProfessionalExperience) ?? items.at(-1) ?? null;
  });

  readonly metrics = computed<ExperienceMetric[]>(() => {
    const experience = this.pageState().experience;
    const primary = this.primaryExperience();

    if (!experience) {
      return [];
    }

    return [
      {
        value: this.formatMetric(experience.timelineItems.length),
        label: this.copy().metricsStages,
      },
      {
        value: this.formatMetric(experience.highlightBadges.length),
        label: this.copy().metricsSignals,
      },
      {
        value: primary?.typeLabel ?? '--',
        label: this.copy().metricsPrimary,
      },
    ];
  });

  readonly featuredActions = computed<PortfolioCallToAction[]>(() => {
    const liveActions = this.pageState().identity?.callToActions;
    if (liveActions?.length) {
      return liveActions.slice(0, 3);
    }

    return [
      {
        type: PortfolioCallToActionType.ViewProjects,
        label: this.copy().defaultViewProjects,
        url: '/projects',
        isExternal: false,
        displayOrder: 1,
        style: 'primary',
      },
      {
        type: PortfolioCallToActionType.ContactMe,
        label: this.copy().defaultContact,
        url: '/contact',
        isExternal: false,
        displayOrder: 2,
        style: 'secondary',
      },
    ];
  });

  isRouterAction(action: PortfolioCallToAction): boolean {
    return !action.isExternal && action.url.startsWith('/') && !action.url.startsWith('/assets/');
  }

  isDownloadAction(action: PortfolioCallToAction): boolean {
    return action.type === PortfolioCallToActionType.DownloadCv;
  }

  ctaClass(action: PortfolioCallToAction): string {
    const style = action.style === 'primary' || action.style === 'secondary' ? action.style : 'link';
    return `cta cta--${style}`;
  }

  actionIcon(type: PortfolioCallToActionType): string {
    switch (type) {
      case PortfolioCallToActionType.ViewProjects:
        return 'bi bi-grid-1x2-fill';
      case PortfolioCallToActionType.DownloadCv:
        return 'bi bi-file-earmark-arrow-down';
      case PortfolioCallToActionType.ContactMe:
        return 'bi bi-chat-square-text';
      case PortfolioCallToActionType.GitHub:
        return 'bi bi-github';
      default:
        return 'bi bi-arrow-right';
    }
  }

  formatMetric(value: number): string {
    return String(value).padStart(2, '0');
  }
}
