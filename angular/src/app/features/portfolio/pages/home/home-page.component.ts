import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PublicThemeService } from '@core/services/public-theme.service';
import { getPortfolioCopy } from '@localization/index';
import {
  PortfolioCallToAction,
  PortfolioCallToActionType,
  PortfolioHomeFeaturedProject,
  PortfolioHomePage,
  PortfolioHomeProfessionalLink,
  PortfolioIdentity,
} from '@features/portfolio/models';
import { PortfolioHomePageApiService } from '@features/portfolio/services/portfolio-home-page-api.service';
import { catchError, combineLatest, map, of, startWith } from 'rxjs';

interface HomePageState {
  data: PortfolioHomePage | null;
  identity: PortfolioIdentity | null;
  loading: boolean;
  detailsError: boolean;
}

interface HomeMetric {
  value: string;
  label: string;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (homeState().loading) {
      <section class="portfolio-state" aria-live="polite">
        <span class="portfolio-state__pulse"></span>
        <p>{{ copy().loading }}</p>
      </section>
    } @else if (!homeState().identity) {
      <section class="portfolio-state portfolio-state--error" role="alert">
        <strong>{{ copy().identityErrorTitle }}</strong>
        <p>{{ copy().identityErrorDescription }}</p>
      </section>
    } @else if (homeState().identity; as identity) {
      <div class="home-page">
        <section class="hero surface" aria-labelledby="portfolio-identity-title">
          <div class="hero__copy">
            <p class="eyebrow">{{ copy().heroEyebrow }}</p>

            <div class="hero__headline">
              <span class="hero__kicker">{{ identity.professionalTitle }}</span>
              <h1 id="portfolio-identity-title">
                <span>{{ identity.fullName }}</span>
                {{ identity.mainMessage }}
              </h1>
            </div>

            <p class="hero__summary">{{ identity.businessSummary }}</p>

            <div class="hero__signals" aria-label="Homepage signals">
              <span>{{ copy().heroSignalStack }}</span>
              <span>{{ copy().heroSignalWorkflow }}</span>
              <span>{{ copy().heroSignalExperience }}</span>
            </div>

            <div class="hero__actions" aria-label="Primary portfolio actions">
              @for (action of identity.callToActions; track action.type) {
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

            @if (professionalLinks().length) {
              <div class="hero__links">
                <span class="hero__links-label">{{ copy().directLinks }}</span>
                <div class="hero__links-list">
                  @for (link of professionalLinks(); track link.type) {
                    <a
                      [href]="link.url"
                      class="hero__link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i [class]="professionalLinkIcon(link)"></i>
                      <span>{{ link.label }}</span>
                    </a>
                  }
                </div>
              </div>
            }

            <div class="hero__audiences" aria-label="Target audience">
              @for (audience of identity.targetAudiences; track audience.type) {
                <span>{{ audience.label }}</span>
              }
            </div>

            <dl class="hero__metrics">
              @for (metric of heroMetrics(); track metric.label) {
                <div class="hero__metric">
                  <dt>{{ metric.value }}</dt>
                  <dd>{{ metric.label }}</dd>
                </div>
              }
            </dl>
          </div>

          <div class="hero__visual">
            <div class="hero__visual-orb hero__visual-orb--primary"></div>
            <div class="hero__visual-orb hero__visual-orb--accent"></div>

            <article class="strategy-card">
              <span class="eyebrow">{{ copy().strategyCardEyebrow }}</span>
              <h2>{{ copy().strategyCardTitle }}</h2>
              <p>{{ copy().strategyCardSummary }}</p>
            </article>

            @if (featuredProject(); as featuredProject) {
              <article class="spotlight-card">
                <div class="spotlight-card__header">
                  <div>
                    <span class="eyebrow">{{ copy().spotlightEyebrow }}</span>
                    <strong>{{ featuredProject.typeLabel }}</strong>
                  </div>
                  <a [routerLink]="projectRoute(featuredProject)" class="spotlight-card__jump">
                    <i class="bi bi-arrow-up-right"></i>
                  </a>
                </div>

                <h3>{{ featuredProject.title }}</h3>
                <p>{{ featuredProject.shortSummary }}</p>

                <div class="spotlight-card__stack">
                  @for (technology of featuredProject.techStack; track technology) {
                    <small>{{ technology }}</small>
                  }
                </div>

                <div class="spotlight-card__actions">
                  <a [routerLink]="projectRoute(featuredProject)" class="link-button">
                    {{ copy().spotlightCta }}
                  </a>
                </div>
              </article>
            } @else {
              <article class="spotlight-card spotlight-card--placeholder">
                <span class="eyebrow">{{ copy().spotlightEyebrow }}</span>
                <h3>{{ identity.visualDirection }}</h3>
                <p>{{ copy().spotlightFallback }}</p>
              </article>
            }
          </div>
        </section>

        @if (homeState().data; as page) {
          <section class="section surface" aria-labelledby="stack-title">
            <div class="section__header">
              <p class="eyebrow">{{ copy().techEyebrow }}</p>
              <h2 id="stack-title">{{ copy().techTitle }}</h2>
              <p>{{ copy().techDescription }}</p>
            </div>

            <div class="stack-grid">
              @for (card of page.techStackCards; track card.type) {
                <article class="stack-card">
                  <span class="stack-card__label">{{ card.label }}</span>
                  <h3>{{ card.headline }}</h3>
                  <p>{{ card.summary }}</p>

                  <div class="stack-card__chips">
                    @for (technology of card.technologies; track technology) {
                      <small>{{ technology }}</small>
                    }
                  </div>
                </article>
              }
            </div>
          </section>

          <section class="section surface" aria-labelledby="featured-title">
            <div class="section__header">
              <p class="eyebrow">{{ copy().featuredEyebrow }}</p>
              <h2 id="featured-title">{{ copy().featuredTitle }}</h2>
              <p>{{ copy().featuredDescription }}</p>
            </div>

            <div class="projects-grid">
              @for (project of page.featuredProjects; track project.slug) {
                <article class="project-card">
                  <div class="project-card__header">
                    <span>{{ project.typeLabel }}</span>
                    <a [routerLink]="projectRoute(project)" class="project-card__jump">
                      <i class="bi bi-arrow-up-right-circle"></i>
                    </a>
                  </div>

                  <h3>{{ project.title }}</h3>
                  <p>{{ project.businessValue }}</p>

                  <div class="project-card__summary">
                    <strong>{{ project.shortSummary }}</strong>
                  </div>

                  <div class="project-card__stack">
                    @for (technology of project.techStack; track technology) {
                      <small>{{ technology }}</small>
                    }
                  </div>

                  <div class="project-card__actions">
                    <a [routerLink]="projectRoute(project)" class="link-button">
                      {{ copy().projectCaseStudy }}
                    </a>

                    @if (project.hasGitHubLink && project.gitHubUrl) {
                      <a [href]="project.gitHubUrl" class="link-button link-button--ghost" target="_blank" rel="noopener noreferrer">
                        {{ copy().projectGithub }}
                      </a>
                    }

                    @if (project.hasLiveDemoLink && project.liveDemoUrl) {
                      <a [href]="project.liveDemoUrl" class="link-button link-button--ghost" target="_blank" rel="noopener noreferrer">
                        {{ copy().projectLiveDemo }}
                      </a>
                    }
                  </div>
                </article>
              }
            </div>

            <div class="section__footer">
              <a routerLink="/projects" class="section__footer-link">{{ copy().viewAllProjects }}</a>
            </div>
          </section>

          <section class="section surface surface--accent" aria-labelledby="erp-title">
            <div class="erp-layout">
              <div class="erp-layout__content">
                <p class="eyebrow">{{ copy().erpEyebrow }}</p>
                <h2 id="erp-title">{{ page.erpExperienceHighlight.headline }}</h2>
                <p>{{ page.erpExperienceHighlight.summary }}</p>

                <div class="erp-layout__note">
                  <strong>{{ copy().architectureNote }}</strong>
                  <p>{{ page.erpExperienceHighlight.architectureNote }}</p>
                </div>

                <a [routerLink]="page.erpExperienceHighlight.projectRoute" class="cta cta--primary">
                  {{ copy().spotlightCta }}
                </a>
              </div>

              <div class="erp-layout__details">
                <div class="erp-layout__capabilities">
                  @for (capability of page.erpExperienceHighlight.capabilities; track capability.type) {
                    <span>{{ capability.label }}</span>
                  }
                </div>

                <div class="erp-layout__highlights">
                  @for (card of page.erpExperienceHighlight.highlightCards; track card.type) {
                    <article class="erp-highlight-card">
                      <span>{{ card.label }}</span>
                      <h3>{{ card.title }}</h3>
                      <p>{{ card.summary }}</p>
                    </article>
                  }
                </div>
              </div>
            </div>
          </section>

          <section class="section surface" aria-labelledby="business-title">
            <div class="section__header">
              <p class="eyebrow">{{ copy().businessEyebrow }}</p>
              <h2 id="business-title">{{ copy().businessTitle }}</h2>
              <p>{{ copy().businessDescription }}</p>
            </div>

            <div class="value-grid">
              @for (item of page.businessValueItems; track item.type) {
                <article class="value-card">
                  <span>{{ item.label }}</span>
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.summary }}</p>
                </article>
              }
            </div>
          </section>

          <section class="contact-banner surface" aria-labelledby="contact-title">
            <div>
              <p class="eyebrow">{{ copy().contactEyebrow }}</p>
              <h2 id="contact-title">{{ page.contactCallToAction.title }}</h2>
              <p>{{ page.contactCallToAction.summary }}</p>
            </div>

            <a [routerLink]="page.contactCallToAction.primaryAction.url" class="cta cta--primary">
              <i [class]="actionIcon(page.contactCallToAction.primaryAction.type)"></i>
              <span>{{ page.contactCallToAction.primaryAction.label }}</span>
            </a>
          </section>
        } @else if (homeState().detailsError) {
          <section class="portfolio-state portfolio-state--warning" role="status">
            <strong>{{ copy().detailsWarningTitle }}</strong>
            <p>{{ copy().detailsWarningDescription }}</p>
          </section>
        }
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .home-page {
        display: grid;
        gap: clamp(1.25rem, 2.8vw, 2rem);
        padding-block: clamp(0.5rem, 2vw, 1rem) clamp(1rem, 2.5vw, 1.5rem);
      }

      .surface,
      .portfolio-state {
        position: relative;
        overflow: hidden;
        border: 1px solid var(--portfolio-border);
        border-radius: 2rem;
        background: color-mix(in srgb, var(--portfolio-bg-elevated) 92%, transparent);
        box-shadow: var(--portfolio-shadow);
      }

      .hero,
      .section,
      .contact-banner,
      .portfolio-state {
        padding: clamp(1.25rem, 3.5vw, 2.5rem);
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
      dd,
      dt {
        margin: 0;
      }

      h1,
      h2,
      h3 {
        color: var(--portfolio-text);
        text-wrap: balance;
      }

      p,
      dd {
        color: var(--portfolio-muted);
        line-height: 1.7;
      }

      .hero {
        display: grid;
        grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr);
        gap: clamp(1.25rem, 3vw, 2rem);
        min-height: min(760px, calc(100vh - 8rem));
        align-items: stretch;
      }

      .hero__copy,
      .hero__visual,
      .strategy-card,
      .spotlight-card,
      .stack-card,
      .project-card,
      .erp-highlight-card,
      .value-card {
        display: grid;
        gap: 1rem;
      }

      .hero__copy {
        align-content: center;
      }

      .hero__headline {
        display: grid;
        gap: 0.9rem;
      }

      .hero__kicker {
        display: inline-flex;
        align-items: center;
        width: fit-content;
        max-width: 100%;
        border: 1px solid color-mix(in srgb, var(--portfolio-primary) 24%, transparent);
        border-radius: 999px;
        padding: 0.5rem 0.9rem;
        background: color-mix(in srgb, var(--portfolio-primary) 8%, transparent);
        color: var(--portfolio-primary);
        font-weight: 700;
        line-height: 1.5;
      }

      h1 {
        max-width: 12ch;
        font-size: clamp(2.65rem, 7vw, 5.9rem);
        line-height: 0.94;
      }

      h1 span {
        display: block;
        margin-block-end: 0.65rem;
        color: var(--portfolio-primary);
        font-size: clamp(1.1rem, 2vw, 1.45rem);
        line-height: 1.2;
      }

      .hero__summary {
        max-width: 58rem;
        font-size: clamp(1rem, 1.65vw, 1.15rem);
      }

      .hero__signals,
      .hero__audiences,
      .hero__links-list,
      .stack-card__chips,
      .project-card__stack,
      .erp-layout__capabilities,
      .spotlight-card__stack {
        display: flex;
        flex-wrap: wrap;
        gap: 0.7rem;
      }

      .hero__signals span,
      .hero__audiences span,
      .hero__links-list a,
      .stack-card__chips small,
      .project-card__stack small,
      .erp-layout__capabilities span,
      .spotlight-card__stack small {
        border: 1px solid var(--portfolio-border);
        border-radius: 999px;
        padding: 0.45rem 0.78rem;
        background: color-mix(in srgb, var(--portfolio-bg-soft) 78%, transparent);
        color: var(--portfolio-text);
        font-size: 0.82rem;
        font-weight: 700;
      }

      .hero__links {
        display: grid;
        gap: 0.8rem;
      }

      .hero__links-label {
        color: var(--portfolio-muted);
        font-size: 0.88rem;
        font-weight: 700;
      }

      .hero__link {
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
        text-decoration: none;
        transition:
          transform 180ms ease,
          border-color 180ms ease,
          background 180ms ease;
      }

      .hero__link:hover,
      .hero__link:focus-visible {
        transform: translateY(-2px);
        border-color: color-mix(in srgb, var(--portfolio-primary) 34%, var(--portfolio-border));
      }

      .hero__metrics {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.9rem;
      }

      .hero__metric {
        padding: 1rem 1.1rem;
        border: 1px solid var(--portfolio-border);
        border-radius: 1.35rem;
        background: color-mix(in srgb, var(--portfolio-bg-soft) 72%, transparent);
      }

      .hero__metric dt {
        color: var(--portfolio-text);
        font-size: clamp(1.6rem, 3.5vw, 2.1rem);
        font-weight: 800;
      }

      .hero__metric dd {
        margin-block-start: 0.2rem;
        font-size: 0.9rem;
      }

      .hero__actions,
      .project-card__actions,
      .spotlight-card__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.8rem;
      }

      .cta,
      .link-button {
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
      .link-button:hover,
      .cta:focus-visible,
      .link-button:focus-visible {
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

      .cta--link,
      .link-button {
        border: 1px solid color-mix(in srgb, var(--portfolio-primary) 22%, var(--portfolio-border));
        background: color-mix(in srgb, var(--portfolio-primary) 9%, transparent);
        color: var(--portfolio-primary);
      }

      .link-button--ghost {
        background: transparent;
        color: var(--portfolio-text);
      }

      .hero__visual {
        position: relative;
        align-content: center;
      }

      .hero__visual-orb {
        position: absolute;
        inset: auto;
        width: min(18rem, 45vw);
        aspect-ratio: 1;
        border-radius: 999px;
        filter: blur(52px);
        opacity: 0.5;
        pointer-events: none;
      }

      .hero__visual-orb--primary {
        inset-inline-start: -4rem;
        top: 2rem;
        background: color-mix(in srgb, var(--portfolio-primary) 34%, transparent);
      }

      .hero__visual-orb--accent {
        inset-inline-end: -3rem;
        bottom: 2rem;
        background: color-mix(in srgb, var(--portfolio-accent) 34%, transparent);
      }

      .strategy-card,
      .spotlight-card {
        position: relative;
        z-index: 1;
        padding: 1.35rem;
        border: 1px solid var(--portfolio-border);
        border-radius: 1.6rem;
        background: color-mix(in srgb, var(--portfolio-bg-elevated) 82%, transparent);
        backdrop-filter: blur(14px);
      }

      .strategy-card h2,
      .section__header h2,
      .contact-banner h2,
      .erp-layout__content h2 {
        font-size: clamp(1.6rem, 3vw, 2.6rem);
        line-height: 1.12;
      }

      .spotlight-card__header,
      .project-card__header {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: start;
      }

      .spotlight-card__header strong,
      .project-card__header span,
      .stack-card__label,
      .value-card span,
      .erp-highlight-card span {
        color: var(--portfolio-accent);
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .spotlight-card__jump,
      .project-card__jump {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.75rem;
        height: 2.75rem;
        border: 1px solid var(--portfolio-border);
        border-radius: 999px;
        background: color-mix(in srgb, var(--portfolio-bg-soft) 74%, transparent);
        text-decoration: none;
        color: var(--portfolio-primary);
      }

      .spotlight-card--placeholder {
        align-content: center;
      }

      .section {
        display: grid;
        gap: 1.5rem;
      }

      .section__header {
        display: grid;
        gap: 0.8rem;
        max-width: 62rem;
      }

      .stack-grid,
      .projects-grid,
      .value-grid,
      .erp-layout__highlights {
        display: grid;
        gap: 1rem;
      }

      .stack-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .projects-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .value-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .stack-card,
      .project-card,
      .value-card,
      .erp-highlight-card {
        padding: 1.35rem;
        border: 1px solid var(--portfolio-border);
        border-radius: 1.55rem;
        background: color-mix(in srgb, var(--portfolio-bg-soft) 78%, transparent);
      }

      .project-card__summary {
        padding: 0.95rem 1rem;
        border-radius: 1.1rem;
        background: color-mix(in srgb, var(--portfolio-primary) 8%, transparent);
        color: var(--portfolio-text);
      }

      .project-card__summary strong {
        color: inherit;
        font-weight: 700;
        line-height: 1.6;
      }

      .section__footer {
        display: flex;
        justify-content: end;
      }

      .section__footer-link {
        color: var(--portfolio-primary);
        font-weight: 800;
        text-decoration: none;
      }

      .surface--accent {
        background:
          linear-gradient(145deg, color-mix(in srgb, var(--portfolio-primary) 12%, transparent), transparent 45%),
          color-mix(in srgb, var(--portfolio-bg-elevated) 90%, transparent);
      }

      .erp-layout {
        display: grid;
        grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
        gap: 1.35rem;
        align-items: start;
      }

      .erp-layout__content,
      .erp-layout__details {
        display: grid;
        gap: 1rem;
      }

      .erp-layout__note {
        padding: 1rem 1.1rem;
        border: 1px solid var(--portfolio-border);
        border-radius: 1.25rem;
        background: color-mix(in srgb, var(--portfolio-bg-soft) 75%, transparent);
      }

      .erp-layout__note strong {
        display: block;
        margin-block-end: 0.4rem;
        color: var(--portfolio-text);
      }

      .contact-banner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1.2rem;
      }

      .portfolio-state {
        display: grid;
        place-items: center;
        gap: 1rem;
        min-height: 18rem;
        text-align: center;
      }

      .portfolio-state strong {
        color: var(--portfolio-text);
        font-size: 1.2rem;
      }

      .portfolio-state__pulse {
        width: 3rem;
        height: 3rem;
        border-radius: 999px;
        border: 0.35rem solid color-mix(in srgb, var(--portfolio-accent) 25%, transparent);
        border-block-start-color: var(--portfolio-primary);
        animation: portfolio-spin 900ms linear infinite;
      }

      .portfolio-state--warning {
        border-style: dashed;
      }

      @keyframes portfolio-spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (prefers-reduced-motion: no-preference) {
        .hero,
        .section,
        .contact-banner,
        .portfolio-state {
          animation: surface-rise 420ms ease both;
        }

        .stack-card,
        .project-card,
        .value-card,
        .erp-highlight-card,
        .strategy-card,
        .spotlight-card,
        .hero__metric {
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
        .erp-layout,
        .stack-grid,
        .projects-grid,
        .value-grid {
          grid-template-columns: 1fr;
        }

        .hero {
          min-height: auto;
        }
      }

      @media (max-width: 820px) {
        .hero__metrics {
          grid-template-columns: 1fr;
        }

        .hero__actions a,
        .project-card__actions a,
        .contact-banner > a {
          flex: 1 1 100%;
        }

        .contact-banner {
          flex-direction: column;
          align-items: stretch;
        }
      }

      @media (max-width: 640px) {
        .hero,
        .section,
        .contact-banner,
        .portfolio-state {
          border-radius: 1.5rem;
        }

        .strategy-card,
        .spotlight-card,
        .stack-card,
        .project-card,
        .value-card,
        .erp-highlight-card,
        .hero__metric {
          border-radius: 1.25rem;
        }

        .hero__signals span,
        .hero__audiences span,
        .hero__links-list a,
        .stack-card__chips small,
        .project-card__stack small,
        .erp-layout__capabilities span,
        .spotlight-card__stack small {
          width: 100%;
          justify-content: center;
          text-align: center;
        }
      }
    `,
  ],
})
export class HomePageComponent {
  private readonly homePageApi = inject(PortfolioHomePageApiService);
  private readonly theme = inject(PublicThemeService);

  readonly copy = computed(() => getPortfolioCopy(this.theme.language(), 'homePage'));

  readonly homeState = toSignal(
    combineLatest({
      identity: this.homePageApi.getIdentity().pipe(catchError(() => of(null))),
      details: this.homePageApi.getHomePage().pipe(
        map(data => ({ data, error: false })),
        catchError(() => of({ data: null, error: true })),
      ),
    }).pipe(
      map(({ identity, details }) => ({
        data: details.data,
        identity,
        loading: false,
        detailsError: details.error,
      })),
      startWith({ data: null, identity: null, loading: true, detailsError: false }),
    ),
    {
      initialValue: { data: null, identity: null, loading: true, detailsError: false } satisfies HomePageState,
    },
  );

  readonly professionalLinks = computed(() => this.homeState().data?.professionalLinks ?? []);

  readonly featuredProject = computed<PortfolioHomeFeaturedProject | null>(() => {
    const page = this.homeState().data;
    if (!page?.featuredProjects.length) {
      return null;
    }

    return (
      page.featuredProjects.find(project => project.caseStudyRoute === page.erpExperienceHighlight.projectRoute) ??
      page.featuredProjects[0]
    );
  });

  readonly heroMetrics = computed<HomeMetric[]>(() => {
    const state = this.homeState();
    const page = state.data;
    const identity = state.identity;

    if (!identity) {
      return [];
    }

    return [
      {
        value: this.formatMetric(page?.featuredProjects.length ?? 0),
        label: this.copy().heroMetricsFeatured,
      },
      {
        value: this.formatMetric(page?.techStackCards.length ?? identity.callToActions.length),
        label: this.copy().heroMetricsStack,
      },
      {
        value: this.formatMetric(page?.erpExperienceHighlight.capabilities.length ?? identity.targetAudiences.length),
        label: page ? this.copy().heroMetricsCapabilities : this.copy().heroMetricsAudience,
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

  professionalLinkIcon(link: PortfolioHomeProfessionalLink): string {
    switch (link.type) {
      case 1:
        return 'bi bi-github';
      case 2:
        return 'bi bi-linkedin';
      default:
        return 'bi bi-link-45deg';
    }
  }

  projectRoute(project: PortfolioHomeFeaturedProject): string {
    return project.caseStudyRoute || `/projects/${project.slug}`;
  }

  private formatMetric(value: number): string {
    return String(value).padStart(2, '0');
  }
}
