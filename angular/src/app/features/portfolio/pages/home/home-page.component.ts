import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  PortfolioCallToAction,
  PortfolioCallToActionType,
  PortfolioHomePage,
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

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (homeState().loading) {
      <section class="portfolio-state portfolio-state--loading" aria-live="polite">
        <span class="portfolio-state__pulse"></span>
        <p>Loading portfolio identity...</p>
      </section>
    } @else if (!homeState().identity) {
      <section class="portfolio-state portfolio-state--error" role="alert">
        <strong>Portfolio identity could not be loaded.</strong>
        <p>Please make sure the API is running and the public portfolio endpoints are available.</p>
      </section>
    } @else if (homeState().identity; as identity) {
      <section class="portfolio-hero" aria-labelledby="portfolio-identity-title">
        <div class="portfolio-hero__copy">
          <p class="portfolio-eyebrow">{{ identity.professionalTitle }}</p>
          <h1 id="portfolio-identity-title">
            <span>{{ identity.fullName }}</span>
            {{ identity.mainMessage }}
          </h1>
          <p class="portfolio-hero__summary">{{ identity.businessSummary }}</p>

          <div class="portfolio-actions" aria-label="Primary portfolio actions">
            @for (action of identity.callToActions; track action.type) {
              @if (isRouterAction(action)) {
                <a [routerLink]="action.url" [class]="ctaClass(action)">
                  {{ action.label }}
                </a>
              } @else {
                <a
                  [href]="action.url"
                  [class]="ctaClass(action)"
                  [attr.target]="action.isExternal ? '_blank' : null"
                  [attr.rel]="action.isExternal ? 'noopener noreferrer' : null"
                  [attr.download]="isDownloadAction(action) ? '' : null"
                >
                  {{ action.label }}
                </a>
              }
            }
          </div>

          <div class="portfolio-tags" aria-label="Target audience">
            @for (audience of identity.targetAudiences; track audience.type) {
              <span>{{ audience.label }}</span>
            }
          </div>
        </div>

        <aside class="portfolio-hero__panel" aria-label="Portfolio positioning">
          <p class="portfolio-eyebrow">Design direction</p>
          <h2>{{ identity.visualDirection }}</h2>
          <div class="portfolio-panel-list" aria-label="Core positioning signals">
            <div>
              <strong>.NET + Angular</strong>
              <span>Full-stack delivery with backend-owned contracts and responsive frontend UX.</span>
            </div>
            <div>
              <strong>ERP workflows</strong>
              <span>Business modules, permissions, validation, reporting, and operational flow thinking.</span>
            </div>
            <div>
              <strong>SaaS-ready design</strong>
              <span>Clean, confident product-style presentation for recruiters, clients, and technical leads.</span>
            </div>
          </div>
        </aside>
      </section>

      @if (homeState().data; as page) {
        <section class="portfolio-section portfolio-section--flat" aria-labelledby="business-value-title">
          <div class="portfolio-section__header">
            <p>Business value</p>
            <h2 id="business-value-title">Enterprise thinking behind the interface</h2>
          </div>
          <div class="portfolio-grid portfolio-grid--three">
            @for (item of page.businessValueItems; track item.type) {
              <article class="portfolio-card">
                <span>{{ item.label }}</span>
                <h3>{{ item.title }}</h3>
                <p>{{ item.summary }}</p>
              </article>
            }
          </div>
        </section>

        <section class="portfolio-section" aria-labelledby="stack-title">
          <div class="portfolio-section__header">
            <p>Full-stack proof</p>
            <h2 id="stack-title">Built around Angular, ASP.NET Core, SQL Server, and workflow rules</h2>
          </div>
          <div class="portfolio-grid portfolio-grid--two">
            @for (card of page.techStackCards; track card.type) {
              <article class="portfolio-card">
                <span>{{ card.label }}</span>
                <h3>{{ card.headline }}</h3>
                <p>{{ card.summary }}</p>
                <div class="portfolio-tags">
                  @for (technology of card.technologies; track technology) {
                    <small>{{ technology }}</small>
                  }
                </div>
              </article>
            }
          </div>
        </section>

        <section class="portfolio-section portfolio-erp" aria-labelledby="erp-title">
          <div>
            <p class="portfolio-eyebrow">ERP workflow focus</p>
            <h2 id="erp-title">{{ page.erpExperienceHighlight.headline }}</h2>
            <p>{{ page.erpExperienceHighlight.summary }}</p>
            <a [routerLink]="page.erpExperienceHighlight.projectRoute">View ERP case study</a>
          </div>
          <div class="portfolio-tags portfolio-tags--roomy">
            @for (capability of page.erpExperienceHighlight.capabilities; track capability.type) {
              <span>{{ capability.label }}</span>
            }
          </div>
        </section>

        <section class="portfolio-section portfolio-section--flat" aria-labelledby="featured-title">
          <div class="portfolio-section__header">
            <p>Featured projects</p>
            <h2 id="featured-title">Case studies shaped around business outcomes</h2>
          </div>
          <div class="portfolio-grid portfolio-grid--two">
            @for (project of page.featuredProjects; track project.slug) {
              <article class="portfolio-card">
                <span>{{ project.typeLabel }}</span>
                <h3>{{ project.title }}</h3>
                <p>{{ project.businessValue }}</p>
                <div class="portfolio-tags">
                  @for (technology of project.techStack; track technology) {
                    <small>{{ technology }}</small>
                  }
                </div>
                <a [routerLink]="project.caseStudyRoute || ['/projects', project.slug]">Read case study</a>
              </article>
            }
          </div>
        </section>

        <section class="portfolio-contact-strip" aria-labelledby="contact-title">
          <div>
            <p>Ready to talk?</p>
            <h2 id="contact-title">{{ page.contactCallToAction.title }}</h2>
            <span>{{ page.contactCallToAction.summary }}</span>
          </div>
          <a [routerLink]="page.contactCallToAction.primaryAction.url">
            {{ page.contactCallToAction.primaryAction.label }}
          </a>
        </section>
      } @else if (homeState().detailsError) {
        <section class="portfolio-state portfolio-state--error" role="status">
          <strong>Identity loaded. Extra homepage sections are temporarily unavailable.</strong>
          <p>The hero still uses the backend identity endpoint for Story 1.1.</p>
        </section>
      }
    }
  `,
  styles: [],
})
export class HomePageComponent {
  private readonly homePageApi = inject(PortfolioHomePageApiService);

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

  isRouterAction(action: PortfolioCallToAction): boolean {
    return !action.isExternal && action.url.startsWith('/') && !action.url.startsWith('/assets/');
  }

  isDownloadAction(action: PortfolioCallToAction): boolean {
    return action.type === PortfolioCallToActionType.DownloadCv;
  }

  ctaClass(action: PortfolioCallToAction): string {
    const style = action.style === 'primary' || action.style === 'secondary' ? action.style : 'link';
    return `portfolio-cta portfolio-cta--${style}`;
  }
}
