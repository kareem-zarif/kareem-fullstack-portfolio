import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PublicThemeService } from '@core/services/public-theme.service';
import { getPortfolioCopy } from '@localization/index';
import {
  PORTFOLIO_PROJECT_CASE_STUDY_SECTION,
  PortfolioProjectCaseStudy,
  PortfolioProjectCaseStudyGalleryItem,
  PortfolioProjectCaseStudyLink,
  PortfolioProjectCaseStudySection,
} from '@features/portfolio/models';
import { PortfolioProjectsApiService } from '@features/portfolio/services/portfolio-projects-api.service';
import { catchError, map, Observable, of, startWith, switchMap } from 'rxjs';

interface ProjectDetailsMetric {
  value: string;
  label: string;
}

type ProjectDetailsPageState =
  | { kind: 'loading' }
  | { kind: 'ready'; project: PortfolioProjectCaseStudy }
  | { kind: 'not-found' }
  | { kind: 'error' };

const PROJECT_CASE_STUDY_NOT_FOUND_ERROR_CODE = 'kareem_fullstack_portfolio:010518';
const INITIAL_STATE: ProjectDetailsPageState = { kind: 'loading' };

@Component({
  selector: 'app-project-details-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (state().kind) {
      @case ('loading') {
        <section class="state-card" aria-live="polite">
          <span class="state-card__pulse" aria-hidden="true"></span>
          <strong>{{ copy().loading }}</strong>
        </section>
      }

      @case ('not-found') {
        <section class="state-card state-card--empty" role="status">
          <strong>{{ copy().notFoundTitle }}</strong>
          <p>{{ copy().notFoundDescription }}</p>

          <div class="state-card__actions">
            <a routerLink="/projects" class="button button--primary">{{ copy().viewAllProjects }}</a>
            <a routerLink="/contact" class="button button--ghost">{{ copy().openContact }}</a>
          </div>
        </section>
      }

      @case ('error') {
        <section class="state-card state-card--error" role="alert">
          <strong>{{ copy().errorTitle }}</strong>
          <p>{{ copy().errorDescription }}</p>

          <div class="state-card__actions">
            <button type="button" class="button button--primary" (click)="retry()">{{ copy().retry }}</button>
            <a routerLink="/projects" class="button button--ghost">{{ copy().viewAllProjects }}</a>
          </div>
        </section>
      }

      @case ('ready') {
        @if (project(); as project) {
          <div class="details-page">
            <section class="surface hero" aria-labelledby="project-case-study-title">
              <div class="hero__copy">
                <a routerLink="/projects" class="back-link">{{ copy().backToProjects }}</a>
                <p class="eyebrow">{{ copy().eyebrow }}</p>

                <div class="hero__labels">
                  <span class="hero__badge">{{ project.projectTypeLabel }}</span>

                  @if (project.isFeatured) {
                    <span class="hero__badge hero__badge--featured">{{ copy().featuredBadge }}</span>
                  }

                  @if (isDatabaseEntitiesStory()) {
                    <span class="hero__badge hero__badge--story">{{ copy().databaseStoryBadge }}</span>
                  }
                </div>

                <h1 id="project-case-study-title">{{ project.title }}</h1>
                <p class="hero__summary">{{ project.shortSummary }}</p>

                <div class="hero__signals" [attr.aria-label]="copy().sectionNavigation">
                  @for (signal of heroSignals(); track signal) {
                    <span>{{ signal }}</span>
                  }
                </div>

                <div class="hero__actions">
                  <a routerLink="/projects" class="button button--primary">{{ copy().viewAllProjects }}</a>
                  <a routerLink="/contact" class="button button--secondary">{{ copy().openContact }}</a>
                </div>
              </div>

              <div class="hero__aside">
                <article class="summary-card">
                  <p class="eyebrow">{{ copy().businessValueLabel }}</p>
                  <p>{{ project.businessValue }}</p>

                  <dl class="metrics-grid">
                    @for (metric of metrics(); track metric.label) {
                      <div class="metric-card">
                        <dt>{{ metric.value }}</dt>
                        <dd>{{ metric.label }}</dd>
                      </div>
                    }
                  </dl>
                </article>

                @if (visibleSections().length) {
                  <nav class="section-nav" [attr.aria-label]="copy().sectionNavigation">
                    @for (section of visibleSections(); track section.type) {
                      <a [href]="'#' + sectionAnchor(section.type)">{{ section.label }}</a>
                    }
                  </nav>
                }
              </div>
            </section>

            @if (project.highlightCards.length) {
              <section class="surface spotlight" [class.spotlight--erp]="isErpCaseStudy()" aria-labelledby="project-highlights-title">
                <div class="section-heading">
                  <p class="eyebrow">
                    {{
                      isErpCaseStudy()
                        ? copy().erpSpotlightEyebrow
                        : isDatabaseEntitiesStory()
                          ? copy().databaseSpotlightEyebrow
                          : copy().highlightsEyebrow
                    }}
                  </p>
                  <h2 id="project-highlights-title">
                    {{
                      isErpCaseStudy()
                        ? copy().erpSpotlightTitle
                        : isDatabaseEntitiesStory()
                          ? copy().databaseSpotlightTitle
                          : copy().highlightsTitle
                    }}
                  </h2>
                  <p>
                    {{
                      isErpCaseStudy()
                        ? copy().erpSpotlightDescription
                        : isDatabaseEntitiesStory()
                          ? copy().databaseSpotlightDescription
                          : copy().highlightsDescription
                    }}
                  </p>
                </div>

                @if (isErpCaseStudy()) {
                  <div class="erp-spotlight">
                    <article class="erp-spotlight__summary">
                      <p class="eyebrow">{{ copy().businessValueLabel }}</p>
                      <h3>{{ project.businessValue }}</h3>
                      <p>{{ project.shortSummary }}</p>

                      <dl class="metrics-grid metrics-grid--erp">
                        @for (metric of erpSpotlightMetrics(); track metric.label) {
                          <div class="metric-card">
                            <dt>{{ metric.value }}</dt>
                            <dd>{{ metric.label }}</dd>
                          </div>
                        }
                      </dl>

                      <div class="chip-grid">
                        @for (technology of project.techStack; track technology) {
                          <span>{{ technology }}</span>
                        }
                      </div>
                    </article>

                    <div class="highlight-grid highlight-grid--erp">
                      @for (card of project.highlightCards; track card.displayOrder) {
                        <article class="highlight-card">
                          <span>{{ card.label }}</span>
                          <h3>{{ card.title }}</h3>
                          <p>{{ card.summary }}</p>
                        </article>
                      }
                    </div>
                  </div>
                } @else {
                  <div class="highlight-grid">
                    @for (card of project.highlightCards; track card.displayOrder) {
                      <article class="highlight-card">
                        <span>{{ card.label }}</span>
                        <h3>{{ card.title }}</h3>
                        <p>{{ card.summary }}</p>
                      </article>
                    }
                  </div>
                }
              </section>
            }

            <section class="story-grid">
              <div class="story-grid__main">
                @if (hasVisibleSection(sectionType.overview) && project.overview) {
                  <article class="surface section-card" [attr.id]="sectionAnchor(sectionType.overview)">
                    <div class="section-heading">
                      <p class="eyebrow">{{ sectionLabel(sectionType.overview) }}</p>
                      <h2>{{ sectionLabel(sectionType.overview) }}</h2>
                    </div>

                    <p>{{ project.overview }}</p>
                  </article>
                }

                @if (hasVisibleSection(sectionType.businessProblem) && project.businessProblem) {
                  <article class="surface section-card" [attr.id]="sectionAnchor(sectionType.businessProblem)">
                    <div class="section-heading">
                      <p class="eyebrow">{{ sectionLabel(sectionType.businessProblem) }}</p>
                      <h2>{{ sectionLabel(sectionType.businessProblem) }}</h2>
                    </div>

                    <p>{{ project.businessProblem }}</p>
                  </article>
                }

                @if (hasVisibleSection(sectionType.solution) && project.solution) {
                  <article class="surface section-card" [attr.id]="sectionAnchor(sectionType.solution)">
                    <div class="section-heading">
                      <p class="eyebrow">{{ sectionLabel(sectionType.solution) }}</p>
                      <h2>{{ sectionLabel(sectionType.solution) }}</h2>
                    </div>

                    <p>{{ project.solution }}</p>
                  </article>
                }

                @if (hasVisibleSection(sectionType.kareemRole) && (project.roleSummary || project.roleResponsibilities.length)) {
                  <article class="surface section-card" [attr.id]="sectionAnchor(sectionType.kareemRole)">
                    <div class="section-heading">
                      <p class="eyebrow">{{ sectionLabel(sectionType.kareemRole) }}</p>
                      <h2>{{ sectionLabel(sectionType.kareemRole) }}</h2>
                    </div>

                    @if (project.roleSummary) {
                      <p>{{ project.roleSummary }}</p>
                    }

                    @if (project.roleResponsibilities.length) {
                      <div class="subsection">
                        <strong>{{ copy().roleResponsibilitiesLabel }}</strong>

                        <ul class="bullet-list">
                          @for (responsibility of project.roleResponsibilities; track responsibility) {
                            <li>{{ responsibility }}</li>
                          }
                        </ul>
                      </div>
                    }
                  </article>
                }

                @if (hasVisibleSection(sectionType.keyFeatures) && project.keyFeatures.length) {
                  <article class="surface section-card" [attr.id]="sectionAnchor(sectionType.keyFeatures)">
                    <div class="section-heading">
                      <p class="eyebrow">
                        {{
                          isErpCaseStudy()
                            ? copy().workflowEyebrow
                            : isDatabaseEntitiesStory()
                              ? copy().databaseEntitiesEyebrow
                              : sectionLabel(sectionType.keyFeatures)
                        }}
                      </p>
                      <h2>
                        {{
                          isErpCaseStudy()
                            ? copy().workflowTitle
                            : isDatabaseEntitiesStory()
                              ? copy().databaseEntitiesTitle
                              : sectionLabel(sectionType.keyFeatures)
                        }}
                      </h2>
                    </div>

                    @if (isDatabaseEntitiesStory()) {
                      <div class="entity-card-grid">
                        @for (feature of project.keyFeatures; track feature; let index = $index) {
                          <article class="entity-card">
                            <small>{{ copy().entityCardLabel }} {{ index + 1 }}</small>
                            <h3>{{ storyCardTitle(feature) }}</h3>
                            <p>{{ storyCardSummary(feature) }}</p>
                          </article>
                        }
                      </div>
                    } @else if (isErpCaseStudy()) {
                      <div class="workflow-card-grid">
                        @for (feature of project.keyFeatures; track feature) {
                          <article class="workflow-card">
                            <span>{{ copy().workflowEyebrow }}</span>
                            <p>{{ feature }}</p>
                          </article>
                        }
                      </div>
                    } @else {
                      <ul class="bullet-list">
                        @for (feature of project.keyFeatures; track feature) {
                          <li>{{ feature }}</li>
                        }
                      </ul>
                    }
                  </article>
                }

                @if (hasVisibleSection(sectionType.architectureNotes) && project.architectureNotes.length) {
                  <article class="surface section-card" [attr.id]="sectionAnchor(sectionType.architectureNotes)">
                    <div class="section-heading">
                      <p class="eyebrow">
                        {{
                          isErpCaseStudy()
                            ? copy().architectureEyebrow
                            : isDatabaseEntitiesStory()
                              ? copy().databaseStandardsEyebrow
                              : sectionLabel(sectionType.architectureNotes)
                        }}
                      </p>
                      <h2>
                        {{
                          isErpCaseStudy()
                            ? copy().architectureTitle
                            : isDatabaseEntitiesStory()
                              ? copy().databaseStandardsTitle
                              : sectionLabel(sectionType.architectureNotes)
                        }}
                      </h2>
                    </div>

                    @if (isDatabaseEntitiesStory()) {
                      <div class="requirement-grid">
                        @for (note of project.architectureNotes; track note; let index = $index) {
                          <article class="requirement-card">
                            <small>{{ copy().requirementCardLabel }} {{ index + 1 }}</small>
                            <p>{{ note }}</p>
                          </article>
                        }
                      </div>
                    } @else if (isErpCaseStudy()) {
                      <div class="insight-grid">
                        @for (note of project.architectureNotes; track note) {
                          <article class="insight-card">
                            <p>{{ note }}</p>
                          </article>
                        }
                      </div>
                    } @else {
                      <ul class="bullet-list">
                        @for (note of project.architectureNotes; track note) {
                          <li>{{ note }}</li>
                        }
                      </ul>
                    }
                  </article>
                }

                @if (hasVisibleSection(sectionType.gallery) && galleryItems().length) {
                  <section class="surface section-card" [attr.id]="sectionAnchor(sectionType.gallery)" aria-labelledby="project-gallery-title">
                    <div class="section-heading">
                      <p class="eyebrow">{{ copy().galleryEyebrow }}</p>
                      <h2 id="project-gallery-title">{{ copy().galleryTitle }}</h2>
                      <p>{{ copy().galleryDescription }}</p>
                    </div>

                    <div class="gallery-grid">
                      @for (item of galleryItems(); track item.displayOrder) {
                        <article class="gallery-card" [class.gallery-card--placeholder]="!item.hasImage">
                          <div class="gallery-card__media">
                            @if (item.hasImage && item.imageUrl) {
                              <img [src]="item.imageUrl" [alt]="item.title" loading="lazy" />
                            } @else {
                              <span>{{ item.typeLabel }}</span>
                            }
                          </div>

                          <div class="gallery-card__body">
                            <small>{{ item.typeLabel }}</small>
                            <h3>{{ item.title }}</h3>
                            <p>{{ item.summary }}</p>
                          </div>
                        </article>
                      }
                    </div>
                  </section>
                }

                @if (hasVisibleSection(sectionType.resultsImpact) && project.results.length) {
                  <article class="surface section-card" [attr.id]="sectionAnchor(sectionType.resultsImpact)">
                    <div class="section-heading">
                      <p class="eyebrow">
                        {{
                          isDatabaseEntitiesStory()
                            ? copy().databaseAcceptanceEyebrow
                            : sectionLabel(sectionType.resultsImpact)
                        }}
                      </p>
                      <h2>
                        {{
                          isDatabaseEntitiesStory()
                            ? copy().databaseAcceptanceTitle
                            : sectionLabel(sectionType.resultsImpact)
                        }}
                      </h2>
                    </div>

                    @if (isDatabaseEntitiesStory()) {
                      <div class="acceptance-grid">
                        @for (result of project.results; track result; let index = $index) {
                          <article class="acceptance-card">
                            <small>{{ copy().acceptanceCardLabel }} {{ index + 1 }}</small>
                            <p>{{ result }}</p>
                          </article>
                        }
                      </div>
                    } @else {
                      <ul class="bullet-list">
                        @for (result of project.results; track result) {
                          <li>{{ result }}</li>
                        }
                      </ul>
                    }
                  </article>
                }
              </div>

              <aside class="story-grid__aside">
                @if (hasVisibleSection(sectionType.techStack) && project.techStack.length) {
                  <article class="surface side-card" [attr.id]="sectionAnchor(sectionType.techStack)">
                    <div class="section-heading">
                      <p class="eyebrow">{{ sectionLabel(sectionType.techStack) }}</p>
                      <h2>{{ sectionLabel(sectionType.techStack) }}</h2>
                    </div>

                    <div class="chip-grid">
                      @for (technology of project.techStack; track technology) {
                        <span>{{ technology }}</span>
                      }
                    </div>
                  </article>
                }

                @if (hasVisibleSection(sectionType.links) && links().length) {
                  <article class="surface side-card" [attr.id]="sectionAnchor(sectionType.links)" aria-labelledby="project-links-title">
                    <div class="section-heading">
                      <p class="eyebrow">{{ copy().linksEyebrow }}</p>
                      <h2 id="project-links-title">{{ copy().linksTitle }}</h2>
                      <p>{{ copy().linksDescription }}</p>
                    </div>

                    <div class="link-list">
                      @for (link of links(); track link.displayOrder) {
                        <a
                          class="link-card"
                          [href]="link.url"
                          [attr.target]="link.isExternal ? '_blank' : null"
                          [attr.rel]="link.isExternal ? 'noopener noreferrer' : null"
                        >
                          <span>{{ link.label }}</span>
                          <strong>{{ link.url }}</strong>
                        </a>
                      }
                    </div>
                  </article>
                }
              </aside>
            </section>
          </div>
        }
      }
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .details-page {
        display: grid;
        gap: clamp(1.25rem, 2.8vw, 2rem);
        padding-block: clamp(0.5rem, 2vw, 1rem) clamp(1rem, 2.5vw, 1.5rem);
      }

      .surface,
      .state-card {
        position: relative;
        overflow: hidden;
        display: grid;
        gap: 1.25rem;
        padding: clamp(1.25rem, 3.5vw, 2.35rem);
        border: 1px solid var(--portfolio-border);
        border-radius: 2rem;
        background: color-mix(in srgb, var(--portfolio-bg-elevated) 92%, transparent);
        box-shadow: var(--portfolio-shadow);
      }

      .hero {
        grid-template-columns: minmax(0, 1.15fr) minmax(300px, 0.85fr);
        gap: clamp(1.2rem, 3vw, 2rem);
        align-items: start;
        background:
          radial-gradient(circle at top right, color-mix(in srgb, var(--portfolio-accent) 16%, transparent), transparent 28%),
          linear-gradient(
            145deg,
            color-mix(in srgb, var(--portfolio-primary) 12%, transparent),
            transparent 46%
          ),
          color-mix(in srgb, var(--portfolio-bg-elevated) 92%, transparent);
      }

      .hero__copy,
      .hero__aside,
      .summary-card,
      .section-card,
      .side-card,
      .highlight-card,
      .metric-card,
      .gallery-card,
      .gallery-card__body,
      .section-heading,
      .subsection,
      .state-card {
        display: grid;
        gap: 1rem;
      }

      .back-link,
      .section-nav a,
      .link-card,
      .button {
        text-decoration: none;
      }

      .back-link {
        width: fit-content;
        color: var(--portfolio-primary);
        font-weight: 800;
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
      small,
      p,
      dl,
      dt,
      dd,
      strong,
      ul {
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
      li,
      .section-nav a,
      .link-card strong,
      .gallery-card__body small {
        color: var(--portfolio-muted);
        line-height: 1.75;
      }

      h1 {
        max-width: 11ch;
        font-size: clamp(2.5rem, 6vw, 5rem);
        line-height: 0.96;
      }

      h2 {
        font-size: clamp(1.35rem, 2.6vw, 2rem);
      }

      h3 {
        font-size: 1.05rem;
      }

      .hero__labels,
      .hero__signals,
      .hero__actions,
      .chip-grid,
      .state-card__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.8rem;
      }

      .hero__badge,
      .hero__signals span,
      .chip-grid span,
      .gallery-card__body small {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: fit-content;
        border: 1px solid var(--portfolio-border);
        border-radius: 999px;
        padding: 0.48rem 0.82rem;
        background: color-mix(in srgb, var(--portfolio-bg-soft) 78%, transparent);
        color: var(--portfolio-text);
        font-size: 0.82rem;
        font-weight: 700;
      }

      .hero__badge--featured,
      .metric-card {
        border-color: color-mix(in srgb, var(--portfolio-primary) 22%, var(--portfolio-border));
        background: color-mix(in srgb, var(--portfolio-primary) 10%, transparent);
      }

      .hero__badge--story {
        border-color: color-mix(in srgb, var(--portfolio-accent) 28%, var(--portfolio-border));
        background: color-mix(in srgb, var(--portfolio-accent) 12%, transparent);
        color: var(--portfolio-accent);
      }

      .hero__summary {
        max-width: 56rem;
        font-size: clamp(1rem, 1.6vw, 1.12rem);
      }

      .summary-card {
        padding: 1.25rem;
        border: 1px solid var(--portfolio-border);
        border-radius: 1.7rem;
        background:
          linear-gradient(
            150deg,
            color-mix(in srgb, var(--portfolio-primary) 14%, transparent),
            transparent 62%
          ),
          color-mix(in srgb, var(--portfolio-bg) 68%, transparent);
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.85rem;
      }

      .metric-card {
        padding: 1rem;
        border-radius: 1.35rem;
      }

      .metric-card dt {
        color: var(--portfolio-text);
        font-size: clamp(1.2rem, 2.5vw, 1.7rem);
        font-weight: 800;
      }

      .metric-card dd {
        margin-block-start: 0.2rem;
        font-size: 0.84rem;
      }

      .section-nav {
        display: flex;
        flex-wrap: wrap;
        gap: 0.7rem;
      }

      .section-nav a {
        border: 1px solid var(--portfolio-border);
        border-radius: 999px;
        padding: 0.68rem 0.9rem;
        background: color-mix(in srgb, var(--portfolio-bg-soft) 80%, transparent);
        font-size: 0.88rem;
        transition:
          transform 180ms ease,
          border-color 180ms ease,
          color 180ms ease;
      }

      .section-nav a:hover,
      .section-nav a:focus-visible,
      .link-card:hover,
      .link-card:focus-visible,
      .button:hover,
      .button:focus-visible {
        transform: translateY(-2px);
      }

      .section-nav a:hover,
      .section-nav a:focus-visible {
        border-color: color-mix(in srgb, var(--portfolio-primary) 32%, var(--portfolio-border));
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
        cursor: pointer;
        transition:
          transform 180ms ease,
          border-color 180ms ease,
          background 180ms ease,
          color 180ms ease,
          opacity 180ms ease;
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

      .spotlight {
        gap: 1.5rem;
      }

      .highlight-grid,
      .gallery-grid,
      .link-list {
        display: grid;
        gap: 1rem;
      }

      .highlight-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .highlight-grid--erp {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .highlight-card {
        padding: 1.2rem;
        border: 1px solid var(--portfolio-border);
        border-radius: 1.5rem;
        background:
          linear-gradient(
            155deg,
            color-mix(in srgb, var(--portfolio-accent) 12%, transparent),
            transparent 60%
          ),
          color-mix(in srgb, var(--portfolio-bg-soft) 82%, transparent);
      }

      .highlight-card span {
        color: var(--portfolio-primary);
        font-size: 0.8rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .story-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
        gap: 1rem;
        align-items: start;
      }

      .story-grid__main,
      .story-grid__aside {
        display: grid;
        gap: 1rem;
      }

      .side-card {
        position: sticky;
        top: 5.75rem;
      }

      .section-card,
      .side-card {
        scroll-margin-top: 6rem;
      }

      .bullet-list {
        display: grid;
        gap: 0.85rem;
        padding: 0;
        list-style: none;
      }

      .bullet-list li {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.8rem;
        align-items: start;
      }

      .bullet-list li::before {
        content: '';
        inline-size: 0.7rem;
        block-size: 0.7rem;
        margin-block-start: 0.45rem;
        border-radius: 999px;
        background: linear-gradient(
          135deg,
          var(--portfolio-primary),
          color-mix(in srgb, var(--portfolio-accent) 72%, var(--portfolio-primary))
        );
        box-shadow: 0 0 0 0.26rem color-mix(in srgb, var(--portfolio-primary) 10%, transparent);
      }

      .chip-grid span {
        width: auto;
      }

      .spotlight--erp {
        gap: 1.75rem;
      }

      .erp-spotlight {
        display: grid;
        grid-template-columns: minmax(280px, 0.82fr) minmax(0, 1.18fr);
        gap: 1rem;
        align-items: start;
      }

      .erp-spotlight__summary,
      .workflow-card-grid,
      .workflow-card,
      .insight-grid,
      .insight-card,
      .entity-card-grid,
      .entity-card,
      .requirement-grid,
      .requirement-card,
      .acceptance-grid,
      .acceptance-card {
        display: grid;
        gap: 1rem;
      }

      .erp-spotlight__summary {
        padding: 1.25rem;
        border: 1px solid color-mix(in srgb, var(--portfolio-primary) 22%, var(--portfolio-border));
        border-radius: 1.6rem;
        background:
          linear-gradient(
            155deg,
            color-mix(in srgb, var(--portfolio-primary) 14%, transparent),
            transparent 62%
          ),
          color-mix(in srgb, var(--portfolio-bg-soft) 82%, transparent);
      }

      .metrics-grid--erp {
        grid-template-columns: 1fr;
      }

      .workflow-card-grid,
      .insight-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .workflow-card,
      .insight-card,
      .entity-card,
      .requirement-card,
      .acceptance-card {
        padding: 1.15rem;
        border: 1px solid var(--portfolio-border);
        border-radius: 1.35rem;
        background: color-mix(in srgb, var(--portfolio-bg-soft) 82%, transparent);
      }

      .entity-card-grid,
      .acceptance-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .requirement-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .entity-card small,
      .requirement-card small,
      .acceptance-card small {
        color: var(--portfolio-accent);
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .entity-card h3 {
        font-size: 1.1rem;
      }

      .acceptance-card {
        background:
          linear-gradient(
            150deg,
            color-mix(in srgb, var(--portfolio-primary) 10%, transparent),
            transparent 62%
          ),
          color-mix(in srgb, var(--portfolio-bg-soft) 84%, transparent);
      }

      .workflow-card span {
        color: var(--portfolio-accent);
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .gallery-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .gallery-card {
        overflow: hidden;
        border: 1px solid var(--portfolio-border);
        border-radius: 1.6rem;
        background: color-mix(in srgb, var(--portfolio-bg-soft) 80%, transparent);
      }

      .gallery-card__media {
        position: relative;
        display: grid;
        place-items: center;
        min-height: 13rem;
        padding: 1.2rem;
        border-block-end: 1px solid var(--portfolio-border);
        background:
          radial-gradient(circle at top left, color-mix(in srgb, var(--portfolio-primary) 18%, transparent), transparent 32%),
          linear-gradient(
            145deg,
            color-mix(in srgb, var(--portfolio-accent) 14%, transparent),
            transparent 62%
          ),
          color-mix(in srgb, var(--portfolio-bg) 70%, transparent);
      }

      .gallery-card__media span {
        color: var(--portfolio-primary);
        font-size: 0.95rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .gallery-card__media img {
        inline-size: 100%;
        block-size: 100%;
        max-block-size: 18rem;
        object-fit: cover;
        border-radius: 1rem;
      }

      .gallery-card__body {
        padding: 1.1rem;
      }

      .gallery-card--placeholder .gallery-card__media {
        min-height: 11.5rem;
      }

      .link-list {
        grid-template-columns: 1fr;
      }

      .link-card {
        display: grid;
        gap: 0.4rem;
        padding: 1rem 1.05rem;
        border: 1px solid var(--portfolio-border);
        border-radius: 1.25rem;
        background: color-mix(in srgb, var(--portfolio-bg-soft) 76%, transparent);
        transition:
          transform 180ms ease,
          border-color 180ms ease,
          background 180ms ease;
      }

      .link-card span {
        color: var(--portfolio-primary);
        font-size: 0.82rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .link-card strong {
        overflow-wrap: anywhere;
      }

      .link-card:hover,
      .link-card:focus-visible {
        border-color: color-mix(in srgb, var(--portfolio-primary) 32%, var(--portfolio-border));
        background: color-mix(in srgb, var(--portfolio-primary) 10%, transparent);
      }

      .state-card {
        min-height: 18rem;
        place-items: center;
        align-content: center;
        text-align: center;
      }

      .state-card strong {
        font-size: 1.2rem;
      }

      .state-card--error {
        border-color: color-mix(in srgb, #c94d4d 34%, var(--portfolio-border));
      }

      .state-card__pulse {
        inline-size: 1rem;
        block-size: 1rem;
        border-radius: 999px;
        background: var(--portfolio-primary);
        box-shadow: 0 0 0 0 color-mix(in srgb, var(--portfolio-primary) 24%, transparent);
        animation: portfolio-pulse 1.2s ease-in-out infinite;
      }

      @keyframes portfolio-pulse {
        0%,
        100% {
          transform: scale(0.92);
          box-shadow: 0 0 0 0 color-mix(in srgb, var(--portfolio-primary) 26%, transparent);
        }
        50% {
          transform: scale(1);
          box-shadow: 0 0 0 0.55rem color-mix(in srgb, var(--portfolio-primary) 0%, transparent);
        }
      }

      @media (prefers-reduced-motion: no-preference) {
        .surface,
        .state-card {
          animation: surface-rise 420ms ease both;
        }

        .highlight-card,
        .gallery-card,
        .metric-card,
        .summary-card,
        .entity-card,
        .requirement-card,
        .acceptance-card {
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
        .story-grid,
        .highlight-grid,
        .highlight-grid--erp,
        .erp-spotlight,
        .workflow-card-grid,
        .insight-grid,
        .entity-card-grid,
        .requirement-grid,
        .acceptance-grid {
          grid-template-columns: 1fr;
        }

        .side-card {
          position: static;
        }
      }

      @media (max-width: 860px) {
        .metrics-grid,
        .gallery-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 640px) {
        .surface,
        .state-card {
          border-radius: 1.5rem;
        }

        .summary-card,
        .highlight-card,
        .gallery-card,
        .metric-card,
        .link-card {
          border-radius: 1.2rem;
        }

        h1 {
          max-width: none;
        }

        .hero__signals span,
        .button,
        .section-nav a,
        .chip-grid span {
          width: 100%;
        }
      }
    `,
  ],
})
export class ProjectDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly projectsApi = inject(PortfolioProjectsApiService);
  private readonly theme = inject(PublicThemeService);
  private readonly reloadVersion = signal(0);

  readonly copy = computed(() => getPortfolioCopy(this.theme.language(), 'projectDetailsPage'));
  readonly sectionType = PORTFOLIO_PROJECT_CASE_STUDY_SECTION;

  private readonly slug = toSignal(
    this.route.paramMap.pipe(map(params => params.get('slug')?.trim() ?? '')),
    { initialValue: '' },
  );

  private readonly requestKey = computed(() => ({
    slug: this.slug(),
    reloadVersion: this.reloadVersion(),
  }));

  readonly state = toSignal(
    toObservable(this.requestKey).pipe(switchMap(({ slug }) => this.loadProjectState(slug))),
    { initialValue: INITIAL_STATE },
  );

  readonly project = computed(() => {
    const state = this.state();
    return state.kind === 'ready' ? state.project : null;
  });
  readonly isErpCaseStudy = computed(() => this.project()?.slug === 'enterprise-erp-system');
  readonly isDatabaseEntitiesStory = computed(() => this.project()?.slug === 'story-4-2-database-entities');
  readonly visibleSections = computed(() =>
    [...(this.project()?.sections ?? [])]
      .filter(section => section.isVisible)
      .sort((left, right) => left.displayOrder - right.displayOrder),
  );
  readonly galleryItems = computed(() =>
    [...(this.project()?.galleryItems ?? [])].sort((left, right) => left.displayOrder - right.displayOrder),
  );
  readonly links = computed(() =>
    [...(this.project()?.links ?? [])].sort((left, right) => left.displayOrder - right.displayOrder),
  );
  readonly metrics = computed<ProjectDetailsMetric[]>(() => {
    const project = this.project();

    if (!project) {
      return [];
    }

    if (this.isDatabaseEntitiesStory()) {
      return [
        {
          value: this.formatMetric(project.keyFeatures.length),
          label: this.copy().metricEntities,
        },
        {
          value: this.formatMetric(project.architectureNotes.length),
          label: this.copy().metricRequirements,
        },
        {
          value: this.formatMetric(project.results.length),
          label: this.copy().metricAcceptance,
        },
      ];
    }

    return [
      {
        value: this.formatMetric(project.techStack.length),
        label: this.copy().metricStack,
      },
      {
        value: this.formatMetric(project.keyFeatures.length),
        label: this.copy().metricFeatures,
      },
      {
        value: this.formatMetric(project.results.length),
        label: this.copy().metricResults,
      },
    ];
  });
  readonly heroSignals = computed(() =>
    this.isDatabaseEntitiesStory()
      ? [this.copy().storySignalScope, this.copy().storySignalCodeFirst, this.copy().storySignalReady]
      : [this.copy().heroSignalBusiness, this.copy().heroSignalResponsive, this.copy().heroSignalTheme],
  );
  readonly erpSpotlightMetrics = computed<ProjectDetailsMetric[]>(() => {
    const project = this.project();

    if (!project || !this.isErpCaseStudy()) {
      return [];
    }

    return [
      {
        value: this.formatMetric(project.highlightCards.length),
        label: this.copy().metricHighlights,
      },
      {
        value: this.formatMetric(project.architectureNotes.length),
        label: this.copy().metricArchitecture,
      },
      {
        value: this.formatMetric(project.keyFeatures.length),
        label: this.copy().metricFeatures,
      },
    ];
  });

  retry(): void {
    this.reloadVersion.update(value => value + 1);
  }

  hasVisibleSection(type: number): boolean {
    return this.visibleSections().some(section => section.type === type);
  }

  sectionLabel(type: number): string {
    return this.visibleSections().find(section => section.type === type)?.label ?? '';
  }

  sectionAnchor(type: number): string {
    switch (type) {
      case this.sectionType.overview:
        return 'section-overview';
      case this.sectionType.businessProblem:
        return 'section-business-problem';
      case this.sectionType.solution:
        return 'section-solution';
      case this.sectionType.kareemRole:
        return 'section-kareem-role';
      case this.sectionType.techStack:
        return 'section-tech-stack';
      case this.sectionType.keyFeatures:
        return 'section-key-features';
      case this.sectionType.architectureNotes:
        return 'section-architecture-notes';
      case this.sectionType.gallery:
        return 'section-gallery';
      case this.sectionType.resultsImpact:
        return 'section-results-impact';
      case this.sectionType.links:
        return 'section-links';
      default:
        return `section-${type}`;
    }
  }

  private loadProjectState(slug: string): Observable<ProjectDetailsPageState> {
    if (!slug) {
      return of({ kind: 'not-found' });
    }

    return this.projectsApi.getProjectBySlug(slug).pipe(
      map(project => ({ kind: 'ready', project }) satisfies ProjectDetailsPageState),
      startWith(INITIAL_STATE),
      catchError(error => of(this.mapErrorToState(error))),
    );
  }

  private mapErrorToState(error: unknown): ProjectDetailsPageState {
    return this.isNotFoundError(error) ? { kind: 'not-found' } : { kind: 'error' };
  }

  private isNotFoundError(error: unknown): boolean {
    if (!(error instanceof HttpErrorResponse)) {
      return false;
    }

    if (error.status === 404) {
      return true;
    }

    return this.extractErrorCodes(error.error).includes(PROJECT_CASE_STUDY_NOT_FOUND_ERROR_CODE);
  }

  private extractErrorCodes(errorBody: unknown): string[] {
    if (!errorBody || typeof errorBody !== 'object') {
      return [];
    }

    const body = errorBody as Record<string, unknown>;
    const nestedError = body['error'];
    const nestedObject =
      nestedError && typeof nestedError === 'object' ? (nestedError as Record<string, unknown>) : undefined;

    return [body['code'], nestedObject?.['code']].filter((value): value is string => typeof value === 'string');
  }

  private formatMetric(value: number): string {
    return String(value).padStart(2, '0');
  }

  storyCardTitle(value: string): string {
    const separatorIndex = value.indexOf(':');
    return separatorIndex >= 0 ? value.slice(0, separatorIndex).trim() : value;
  }

  storyCardSummary(value: string): string {
    const separatorIndex = value.indexOf(':');
    return separatorIndex >= 0 ? value.slice(separatorIndex + 1).trim() : value;
  }
}
