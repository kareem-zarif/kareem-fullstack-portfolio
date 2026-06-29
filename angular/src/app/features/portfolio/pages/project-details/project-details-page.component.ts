import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PublicThemeService } from '@core/services/public-theme.service';
import { getPortfolioCopy } from '@localization/index';
import {
  PORTFOLIO_PROJECT_CASE_STUDY_SECTION,
  PortfolioProjectCaseStudy,
  PortfolioProjectCaseStudyLink,
} from '@features/portfolio/models';
import { PortfolioProjectsApiService } from '@features/portfolio/services/portfolio-projects-api.service';
import { TechChipComponent, TechChipAccent } from '@shared/atoms/tech-chip.component';
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
const TECH_ACCENTS: TechChipAccent[] = ['lime', 'teal', 'info'];

@Component({
  selector: 'app-project-details-page',
  standalone: true,
  imports: [RouterLink, TechChipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- ───────────────────────────── LOADING ─────────────────────────────── -->
    @if (state().kind === 'loading') {
      <div class="page-loading" role="status" [attr.aria-label]="copy().loading">
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
      </div>
    } @else if (state().kind === 'not-found') {
      <!-- ───────────────────────────── NOT FOUND ──────────────────────────── -->
      <section class="state-wrap">
        <div class="notfound">
          <div class="nf-ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /><path d="m13.5 8.5-5 5" /><path d="m8.5 8.5 5 5" />
            </svg>
          </div>
          <h2>{{ copy().notFoundTitle }}</h2>
          <p>{{ copy().notFoundDescription }}</p>
          <a class="act act-primary" routerLink="/projects">
            <svg class="flip-rtl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
            <span>{{ copy().viewAllProjects }}</span>
          </a>
        </div>
      </section>
    } @else if (state().kind === 'error') {
      <!-- ───────────────────────────── ERROR ──────────────────────────────── -->
      <section class="state-wrap">
        <div class="state-card">
          <h2 class="state-title">{{ copy().errorTitle }}</h2>
          <p class="state-desc">{{ copy().errorDescription }}</p>
          <button type="button" class="act act-primary" (click)="retry()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 2v6h6" /><path d="M3 13a9 9 0 1 0 3-7.7L3 8" /></svg>
            <span>{{ copy().retry }}</span>
          </button>
        </div>
      </section>
    } @else if (project(); as p) {

      <!-- ───────────────────────────── BREADCRUMB ─────────────────────────── -->
      <nav class="crumbs reveal-item" data-d="1" aria-label="Breadcrumb">
        <a routerLink="/projects">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v3" /><path d="M2 12h20" /></svg>
          <span>{{ copy().breadcrumbProjects }}</span>
        </a>
        <span class="sep"><svg class="flip-rtl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg></span>
        <span class="here">{{ p.title }}</span>
      </nav>

      <!-- ───────────────────────────── HERO ───────────────────────────────── -->
      <section class="cs-hero">
        <div class="cs-hero-grid">
          <div class="cs-head">
            <div class="type-row reveal-item" data-d="1">
              <span class="proj-type">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
                <span>{{ p.projectTypeLabel }}</span>
              </span>
              @if (p.isFeatured) {
                <span class="featured-badge">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  <span>{{ copy().featuredBadge }}</span>
                </span>
              }
            </div>

            <h1 class="reveal-item" data-d="2">{{ p.title }}</h1>
            <p class="lede reveal-item" data-d="3">{{ p.overview || p.shortSummary }}</p>

            <div class="cs-actions reveal-item" data-d="4">
              @for (link of links(); track link.type) {
                <a
                  class="act"
                  [href]="link.url"
                  [attr.target]="link.isExternal ? '_blank' : null"
                  [attr.rel]="link.isExternal ? 'noopener noreferrer' : null"
                >
                  @if (isGitHubLink(link)) {
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" /></svg>
                  } @else {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
                  }
                  <span>{{ link.label }}</span>
                </a>
              }
              <a class="act act-primary" routerLink="/contact">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                <span>{{ copy().openContact }}</span>
              </a>
              <a class="act" routerLink="/projects">
                <svg class="flip-rtl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                <span>{{ copy().backToProjects }}</span>
              </a>
            </div>

            <div class="signals reveal-item" data-d="4">
              @for (signal of heroSignals(); track signal) {
                <span class="signal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                  {{ signal }}
                </span>
              }
            </div>
          </div>

          <aside class="facts reveal-item" data-d="4" aria-label="Project facts">
            <div class="fact-metrics">
              @for (metric of metrics(); track metric.label) {
                <div class="metric">
                  <div class="m-num">{{ metric.value }}</div>
                  <div class="m-lbl">{{ metric.label }}</div>
                </div>
              }
            </div>
            <div class="facts-card">
              <div class="fc-title">{{ copy().factsTitle }}</div>
              <ul>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9A1 1 0 0 0 21.4 6.08Z" /><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" /></svg>
                  <span class="fv"><span class="fk">{{ copy().factTypeLabel }}</span><b>{{ p.projectTypeLabel }}</b></span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                  <span class="fv"><span class="fk">{{ copy().factStackLabel }}</span><b>{{ p.techStack.length }} {{ copy().factStackUnit }}</b></span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  <span class="fv"><span class="fk">{{ copy().factHighlightsLabel }}</span><b>{{ p.highlightCards.length }} {{ copy().factHighlightsUnit }}</b></span>
                </li>
              </ul>
              @if (p.businessValue) {
                <div class="fc-value">
                  <span class="fc-value-label">{{ copy().businessValueLabel }}</span>
                  <p>{{ p.businessValue }}</p>
                </div>
              }
            </div>
          </aside>
        </div>
      </section>

      <!-- ───────────────────────────── STORY BODY ─────────────────────────── -->
      <div class="cs-body">

        <!-- HIGHLIGHTS -->
        @if (p.highlightCards.length) {
          <section class="cs-block reveal-item" data-d="1">
            <div class="block-head">
              <span class="block-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg></span>
              <div>
                <div class="block-kicker">{{ copy().highlightsEyebrow }}</div>
                <h2>{{ copy().highlightsTitle }}</h2>
              </div>
            </div>
            <div class="feature-grid">
              @for (card of highlightCards(); track card.type) {
                <div class="feature">
                  <span class="f-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg></span>
                  <h3>{{ card.title }}</h3>
                  <p>{{ card.summary }}</p>
                </div>
              }
            </div>
          </section>
        }

        <!-- PROBLEM + SOLUTION -->
        @if (p.businessProblem || p.solution) {
          <div class="split">
            @if (p.businessProblem) {
              <section class="cs-block problem reveal-item" data-d="1">
                <div class="block-head">
                  <span class="block-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg></span>
                  <div>
                    <div class="block-kicker">{{ copy().kProblem }}</div>
                    <h2>{{ sectionLabel(sectionType.businessProblem) || copy().kProblem }}</h2>
                  </div>
                </div>
                <p>{{ p.businessProblem }}</p>
              </section>
            }
            @if (p.solution) {
              <section class="cs-block solution reveal-item" data-d="2">
                <div class="block-head">
                  <span class="block-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" /></svg></span>
                  <div>
                    <div class="block-kicker">{{ copy().kSolution }}</div>
                    <h2>{{ sectionLabel(sectionType.solution) || copy().kSolution }}</h2>
                  </div>
                </div>
                <p>{{ p.solution }}</p>
              </section>
            }
          </div>
        }

        <!-- ROLE -->
        @if (p.roleSummary || p.roleResponsibilities.length) {
          <section class="cs-block reveal-item" data-d="1">
            <div class="block-head">
              <span class="block-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="15" r="3" /><circle cx="9" cy="7" r="4" /><path d="M10 15H6a4 4 0 0 0-4 4v2" /><path d="m21.7 16.4-.9-.3" /><path d="m15.2 13.9-.9-.3" /><path d="m16.6 18.7.3-.9" /><path d="m19.1 12.2.3-.9" /><path d="m19.6 18.7-.4-1" /><path d="m16.8 12.3-.4-1" /><path d="m14.3 16.6 1-.4" /><path d="m20.7 13.8 1-.4" /></svg></span>
              <div>
                <div class="block-kicker">{{ copy().kRole }}</div>
                <h2>{{ sectionLabel(sectionType.kareemRole) || copy().kRole }}</h2>
              </div>
            </div>
            @if (p.roleSummary) { <p>{{ p.roleSummary }}</p> }
            @if (p.roleResponsibilities.length) {
              <div class="role-chips">
                @for (item of p.roleResponsibilities; track item) {
                  <span class="role-chip">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                    {{ item }}
                  </span>
                }
              </div>
            }
          </section>
        }

        <!-- TECH STACK -->
        @if (p.techStack.length) {
          <section class="cs-block reveal-item" data-d="1">
            <div class="block-head">
              <span class="block-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg></span>
              <div>
                <div class="block-kicker">{{ copy().kTech }}</div>
                <h2>{{ sectionLabel(sectionType.techStack) || copy().kTech }}</h2>
              </div>
            </div>
            <div class="chips-wrap">
              @for (tech of p.techStack; track tech; let i = $index) {
                <app-tech-chip [label]="tech" [accent]="techAccent(i)" />
              }
            </div>
          </section>
        }

        <!-- KEY FEATURES -->
        @if (p.keyFeatures.length) {
          <section class="cs-block reveal-item" data-d="1">
            <div class="block-head">
              <span class="block-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 17 2 2 4-4" /><path d="m3 7 2 2 4-4" /><path d="M13 6h8" /><path d="M13 12h8" /><path d="M13 18h8" /></svg></span>
              <div>
                <div class="block-kicker">{{ copy().kFeatures }}</div>
                <h2>{{ sectionLabel(sectionType.keyFeatures) || copy().kFeatures }}</h2>
              </div>
            </div>
            <div class="feature-grid">
              @for (feature of p.keyFeatures; track feature) {
                <div class="feature">
                  <span class="f-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg></span>
                  <h3>{{ featureTitle(feature) }}</h3>
                  @if (featureSummary(feature); as summary) { <p>{{ summary }}</p> }
                </div>
              }
            </div>
          </section>
        }

        <!-- ARCHITECTURE -->
        @if (p.architectureNotes.length) {
          <section class="cs-block reveal-item" data-d="1">
            <div class="block-head">
              <span class="block-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="16" y="16" width="6" height="6" rx="1" /><rect x="2" y="16" width="6" height="6" rx="1" /><rect x="9" y="2" width="6" height="6" rx="1" /><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" /><path d="M12 12V8" /></svg></span>
              <div>
                <div class="block-kicker">{{ copy().kArchitecture }}</div>
                <h2>{{ sectionLabel(sectionType.architectureNotes) || copy().kArchitecture }}</h2>
              </div>
            </div>
            <ul class="arch-notes">
              @for (note of p.architectureNotes; track note) {
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3v12" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" /></svg>
                  <span>{{ note }}</span>
                </li>
              }
            </ul>
          </section>
        }

        <!-- GALLERY -->
        @if (galleryItems().length) {
          <section class="cs-block reveal-item" data-d="1">
            <div class="block-head">
              <span class="block-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg></span>
              <div>
                <div class="block-kicker">{{ copy().kGallery }}</div>
                <h2>{{ sectionLabel(sectionType.gallery) || copy().galleryTitle }}</h2>
              </div>
            </div>
            <div class="gallery">
              @for (item of galleryItems(); track item.title; let first = $first) {
                <figure class="shot" [class.big]="first">
                  @if (item.hasImage && item.imageUrl) {
                    <img [src]="item.imageUrl" [alt]="item.title" loading="lazy" />
                  } @else {
                    <span class="ph-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg></span>
                    <figcaption class="ph-label">{{ item.title }}</figcaption>
                    <span class="ph-tag">{{ item.typeLabel || copy().placeholderLabel }}</span>
                  }
                </figure>
              }
            </div>
          </section>
        }

        <!-- RESULTS -->
        @if (p.results.length) {
          <section class="cs-block results reveal-item" data-d="1">
            <div class="block-head">
              <span class="block-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg></span>
              <div>
                <div class="block-kicker">{{ copy().kResults }}</div>
                <h2>{{ sectionLabel(sectionType.resultsImpact) || copy().kResults }}</h2>
              </div>
            </div>
            <div class="result-grid">
              @for (result of p.results; track result) {
                <div class="result">
                  <svg class="r-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                  <p class="r-lbl">{{ result }}</p>
                </div>
              }
            </div>
          </section>
        }

        <!-- LINKS / CTA -->
        <section class="cs-block cta-block reveal-item" data-d="1">
          <div class="cta-text">
            <h2>{{ copy().linksTitle }}</h2>
            <p>{{ copy().linksDescription }}</p>
          </div>
          <div class="cta-actions">
            @for (link of links(); track link.type) {
              <a
                class="act"
                [href]="link.url"
                [attr.target]="link.isExternal ? '_blank' : null"
                [attr.rel]="link.isExternal ? 'noopener noreferrer' : null"
              >
                @if (isGitHubLink(link)) {
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" /></svg>
                } @else {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
                }
                <span>{{ link.label }}</span>
              </a>
            }
            <a class="act act-primary" routerLink="/contact">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
              <span>{{ copy().openContact }}</span>
            </a>
            <a class="act" routerLink="/projects">
              <svg class="flip-rtl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
              <span>{{ copy().viewAllProjects }}</span>
            </a>
          </div>
        </section>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

    /* ── Breadcrumb ──────────────────────────────────────────────────────── */
    .crumbs {
      position: relative; z-index: 1; max-width: var(--rail, 1180px); margin: 0 auto;
      padding: 18px 28px 0; display: flex; align-items: center; gap: 8px;
      font-size: 13px; color: var(--text-faint, #9a9c95); flex-wrap: wrap;
    }
    .crumbs a { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; color: var(--text-muted, #c7c9c2); transition: color var(--dur-fast, 150ms) var(--ease); }
    .crumbs a:hover { color: var(--accent-text, #b2e742); }
    .crumbs a svg { width: 15px; height: 15px; }
    .crumbs .sep svg { width: 14px; height: 14px; }
    .crumbs .here { color: var(--text, #f4f5f0); font-weight: 600; }

    /* ── Hero ────────────────────────────────────────────────────────────── */
    .cs-hero { position: relative; z-index: 1; max-width: var(--rail, 1180px); margin: 0 auto; padding: clamp(22px, 3vw, 34px) 28px clamp(8px, 2vw, 16px); }
    .cs-hero-grid { display: grid; grid-template-columns: 1.3fr .85fr; gap: clamp(24px, 3vw, 40px); align-items: start; }
    .type-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .proj-type {
      display: inline-flex; align-items: center; gap: 7px; height: 30px; padding: 0 12px;
      border-radius: var(--r-full, 9999px); font-size: 12px; font-weight: 700; letter-spacing: .02em;
      background: var(--accent-soft); color: var(--accent-text, #537c0f); border: 1px solid var(--chip-border, #e5e7eb); white-space: nowrap;
    }
    .proj-type svg { width: 15px; height: 15px; }
    .featured-badge {
      display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 12px;
      border-radius: var(--r-full, 9999px); font-size: 12px; font-weight: 700; color: #fff;
      background: var(--gradient-brand); border: 1px solid rgba(255, 255, 255, .16); box-shadow: var(--shadow-btn); white-space: nowrap;
    }
    .featured-badge svg { width: 13px; height: 13px; }
    .cs-head h1 {
      margin-top: 18px; font-size: clamp(1.9rem, 4vw, 2.9rem); font-weight: 700;
      letter-spacing: -.02em; line-height: 1.08; color: var(--text, #f4f5f0);
    }
    :host-context([lang="ar"]) .cs-head h1 { letter-spacing: 0; line-height: 1.25; }
    .cs-head .lede { margin-top: 16px; font-size: clamp(1rem, 1.5vw, 1.12rem); color: var(--text-muted, #c7c9c2); line-height: 1.65; max-width: 56ch; text-wrap: pretty; }

    .cs-actions { margin-top: 26px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .act {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 46px; padding: 0 18px;
      border-radius: var(--r, 8px); font-size: 14px; font-weight: 600; white-space: nowrap;
      background: var(--surface, #1e1e1e); border: 1px solid var(--border, #2e2e2e); color: var(--text, #f4f5f0); box-shadow: var(--shadow-sm);
      transition: transform var(--dur-fast, 150ms) var(--ease), border-color var(--dur-fast, 150ms) var(--ease), filter var(--dur, 240ms) var(--ease);
    }
    .act svg { width: 17px; height: 17px; flex-shrink: 0; }
    .act:hover { border-color: var(--accent-line, #b2e742); transform: translateY(-1px); }
    .act-primary { background: var(--gradient-brand); color: #fff; border-color: rgba(255, 255, 255, .14); box-shadow: var(--shadow-btn); }
    .act-primary:hover { filter: brightness(1.07); border-color: rgba(255, 255, 255, .28); }
    :host-context([dir="rtl"]) .flip-rtl { transform: scaleX(-1); }

    .signals { margin-top: 18px; display: flex; flex-wrap: wrap; gap: 8px; }
    .signal { display: inline-flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 600; color: var(--text-faint, #9a9c95); }
    .signal svg { width: 15px; height: 15px; color: var(--accent-text, #b2e742); flex-shrink: 0; }

    /* hero facts board */
    .facts { display: flex; flex-direction: column; gap: 12px; }
    .fact-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .metric {
      background: var(--surface, #1e1e1e); border: 1px solid var(--border, #2e2e2e); border-radius: var(--r-lg, 12px); padding: 16px 16px 14px;
      transition: border-color var(--dur, 240ms) var(--ease), box-shadow var(--dur, 240ms) var(--ease), transform var(--dur, 240ms) var(--ease);
    }
    .metric:hover { border-color: var(--accent-line, #b2e742); box-shadow: var(--shadow-lift); transform: translateY(-2px); }
    .metric .m-num { font-size: 1.7rem; font-weight: 700; color: var(--accent-text, #b2e742); letter-spacing: -.02em; font-variant-numeric: tabular-nums; line-height: 1; }
    .metric .m-lbl { margin-top: 7px; font-size: 11.5px; font-weight: 600; color: var(--text-faint, #9a9c95); line-height: 1.35; }
    .facts-card { background: var(--surface, #1e1e1e); border: 1px solid var(--border, #2e2e2e); border-radius: var(--r-lg, 12px); padding: 16px 18px; }
    .fc-title { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--text-faint, #9a9c95); }
    :host-context([lang="ar"]) .fc-title { letter-spacing: 0; }
    .facts-card ul { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-direction: column; gap: 11px; }
    .facts-card li { display: flex; align-items: flex-start; gap: 11px; font-size: 13.5px; }
    .facts-card li svg { width: 16px; height: 16px; color: var(--accent-text, #b2e742); flex-shrink: 0; margin-top: 2px; }
    .facts-card li .fk { color: var(--text-faint, #9a9c95); font-weight: 600; }
    .facts-card li .fv { display: flex; flex-direction: column; min-width: 0; }
    .facts-card li b { color: var(--text, #f4f5f0); font-weight: 600; }
    .fc-value { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border-soft, rgba(255,255,255,.06)); }
    .fc-value-label { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--accent-text, #b2e742); }
    :host-context([lang="ar"]) .fc-value-label { letter-spacing: 0; }
    .fc-value p { margin: 8px 0 0; font-size: 13.5px; line-height: 1.6; color: var(--text-muted, #c7c9c2); }

    /* ── Story blocks ────────────────────────────────────────────────────── */
    .cs-body {
      position: relative; z-index: 1; max-width: var(--rail, 1180px); margin: 0 auto;
      padding: clamp(20px, 3vw, 32px) 28px clamp(40px, 6vw, 72px);
      display: grid; grid-template-columns: 1fr; gap: clamp(20px, 3vw, 30px);
    }
    .cs-block {
      background: var(--surface, #1e1e1e); border: 1px solid var(--border, #2e2e2e); border-radius: var(--r-xl, 16px);
      box-shadow: var(--shadow-card); padding: clamp(22px, 3vw, 32px);
      transition: border-color var(--dur, 240ms) var(--ease), box-shadow var(--dur, 240ms) var(--ease);
    }
    .cs-block:hover { border-color: #cbd5e1; }
    :host-context([data-theme="dark"]) .cs-block:hover { border-color: #3a3a3a; }
    .block-head { display: flex; align-items: center; gap: 13px; }
    .block-ico {
      width: 42px; height: 42px; flex-shrink: 0; border-radius: var(--r, 8px); display: flex; align-items: center; justify-content: center;
      background: var(--accent-soft); border: 1px solid var(--chip-border, #e5e7eb); color: var(--accent-text, #537c0f);
    }
    .block-ico svg { width: 20px; height: 20px; }
    .block-kicker { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--text-faint, #9a9c95); }
    :host-context([lang="ar"]) .block-kicker { letter-spacing: 0; }
    .block-head h2 { margin-top: 3px; font-size: clamp(1.25rem, 2vw, 1.5rem); font-weight: 700; letter-spacing: -.01em; line-height: 1.2; color: var(--text, #f4f5f0); }
    :host-context([lang="ar"]) .block-head h2 { letter-spacing: 0; }
    .cs-block > p { margin-top: 16px; font-size: 15px; color: var(--text-muted, #c7c9c2); line-height: 1.7; max-width: 72ch; text-wrap: pretty; }

    /* problem / solution split */
    .split { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(18px, 2.5vw, 24px); }
    .problem .block-ico { background: rgba(239, 68, 68, .12); border-color: rgba(239, 68, 68, .22); color: #ef4444; }

    /* role chips */
    .role-chips { margin-top: 20px; display: flex; flex-wrap: wrap; gap: 10px; }
    .role-chip {
      display: inline-flex; align-items: center; gap: 8px; min-height: 38px; padding: 8px 15px;
      border-radius: var(--r-full, 9999px); background: var(--chip-bg, #1f1f1f); border: 1px solid var(--chip-border, #333);
      font-size: 13.5px; font-weight: 600; color: var(--text, #f4f5f0); line-height: 1.35;
    }
    .role-chip svg { width: 16px; height: 16px; color: var(--accent-text, #b2e742); flex-shrink: 0; }

    /* tech chips */
    .chips-wrap { margin-top: 20px; display: flex; flex-wrap: wrap; gap: 10px; }

    /* feature grid */
    .feature-grid { margin-top: 22px; display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 14px; }
    .feature {
      padding: 18px; border-radius: var(--r-lg, 12px); background: var(--surface-2, #1a1a1a); border: 1px solid var(--border, #2e2e2e);
      transition: border-color var(--dur, 240ms) var(--ease), transform var(--dur, 240ms) var(--ease), box-shadow var(--dur, 240ms) var(--ease);
    }
    .feature:hover { border-color: var(--accent-line, #b2e742); transform: translateY(-3px); box-shadow: var(--shadow-lift); }
    .feature .f-ico {
      width: 38px; height: 38px; border-radius: var(--r-sm, 6px); display: flex; align-items: center; justify-content: center;
      background: var(--accent-soft); border: 1px solid var(--chip-border, #e5e7eb); color: var(--accent-text, #537c0f);
    }
    .feature .f-ico svg { width: 19px; height: 19px; }
    .feature h3 { margin-top: 14px; font-size: 15px; font-weight: 700; color: var(--text, #f4f5f0); }
    .feature p { margin-top: 7px; font-size: 13px; color: var(--text-muted, #c7c9c2); line-height: 1.55; }

    /* architecture notes */
    .arch-notes { margin: 20px 0 0; padding: 0; display: flex; flex-direction: column; gap: 11px; }
    .arch-notes li { display: flex; align-items: flex-start; gap: 11px; font-size: 14px; color: var(--text, #f4f5f0); line-height: 1.55; list-style: none; }
    .arch-notes li svg { width: 17px; height: 17px; color: var(--accent-text, #b2e742); flex-shrink: 0; margin-top: 2px; }

    /* gallery */
    .gallery { margin-top: 22px; display: grid; grid-template-columns: 2fr 1fr 1fr; grid-auto-rows: 150px; gap: 14px; }
    .shot {
      position: relative; overflow: hidden; margin: 0; border-radius: var(--r-lg, 12px); background: var(--surface-2, #1a1a1a);
      border: 1px solid var(--border, #2e2e2e); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
      transition: border-color var(--dur, 240ms) var(--ease), transform var(--dur, 240ms) var(--ease);
    }
    .shot:hover { border-color: var(--accent-line, #b2e742); transform: translateY(-2px); }
    .shot.big { grid-row: span 2; }
    .shot img { width: 100%; height: 100%; object-fit: cover; }
    .shot .ph-ico {
      width: 46px; height: 46px; border-radius: var(--r, 8px); display: flex; align-items: center; justify-content: center;
      background: var(--accent-soft); border: 1px solid var(--chip-border, #e5e7eb); color: var(--accent-text, #537c0f);
    }
    .shot .ph-ico svg { width: 22px; height: 22px; }
    .shot .ph-label { font-size: 12.5px; font-weight: 600; color: var(--text-muted, #c7c9c2); text-align: center; padding: 0 14px; }
    .shot .ph-tag { font-size: 10.5px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: var(--text-faint, #9a9c95); }
    :host-context([lang="ar"]) .shot .ph-tag { letter-spacing: 0; }

    /* results */
    .results .block-ico { background: rgba(0, 163, 137, .12); border-color: rgba(0, 163, 137, .22); color: var(--teal, #00a389); }
    .result-grid { margin-top: 22px; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; }
    .result { display: flex; align-items: flex-start; gap: 12px; padding: 18px 20px; border-radius: var(--r-lg, 12px); background: var(--surface-2, #1a1a1a); border: 1px solid var(--border, #2e2e2e); }
    .result .r-ico { width: 20px; height: 20px; color: var(--teal, #00a389); flex-shrink: 0; margin-top: 1px; }
    .result .r-lbl { margin: 0; font-size: 13.5px; color: var(--text-muted, #c7c9c2); line-height: 1.55; }

    /* links / CTA */
    .cta-block {
      display: flex; align-items: center; gap: clamp(18px, 3vw, 32px); flex-wrap: wrap;
      background: radial-gradient(120% 140% at 100% 0%, var(--accent-soft), transparent 62%), var(--surface, #1e1e1e);
    }
    .cta-block .cta-text { min-width: 0; flex: 1 1 320px; }
    .cta-block h2 { font-size: clamp(1.3rem, 2.2vw, 1.6rem); font-weight: 700; letter-spacing: -.01em; color: var(--text, #f4f5f0); }
    :host-context([lang="ar"]) .cta-block h2 { letter-spacing: 0; }
    .cta-block p { margin-top: 10px; max-width: 52ch; font-size: 14px; color: var(--text-muted, #c7c9c2); line-height: 1.6; }
    .cta-block .cta-actions { display: flex; gap: 10px; flex-wrap: wrap; }

    /* ── States ──────────────────────────────────────────────────────────── */
    .state-wrap { position: relative; z-index: 1; max-width: var(--rail, 1180px); margin: 0 auto; padding: clamp(48px, 8vw, 96px) 28px; }
    .state-card {
      background: var(--surface, #1e1e1e); border: 1px solid var(--border, #2e2e2e); border-radius: var(--r-xl, 16px);
      box-shadow: var(--shadow-card); padding: clamp(28px, 5vw, 48px); max-width: 560px;
    }
    .state-title { margin: 0; font-size: clamp(1.2rem, 2.4vw, 1.5rem); font-weight: 700; color: var(--text, #f4f5f0); }
    .state-desc { margin: 12px 0 0; font-size: 14.5px; line-height: 1.6; color: var(--text-muted, #c7c9c2); }
    .state-card .act { margin-top: 22px; }

    .notfound { position: relative; z-index: 1; max-width: 640px; margin: 0 auto; text-align: center; }
    .notfound .nf-ico {
      width: 72px; height: 72px; margin: 0 auto; border-radius: var(--r-xl, 16px); display: flex; align-items: center; justify-content: center;
      background: var(--accent-soft); border: 1px solid var(--chip-border, #e5e7eb); color: var(--accent-text, #537c0f);
    }
    .notfound .nf-ico svg { width: 32px; height: 32px; }
    .notfound h2 { margin-top: 20px; font-size: 1.4rem; font-weight: 700; color: var(--text, #f4f5f0); }
    .notfound p { margin-top: 10px; font-size: 15px; color: var(--text-muted, #c7c9c2); }
    .notfound .act { margin-top: 22px; display: inline-flex; }

    .page-loading { display: flex; justify-content: center; align-items: center; gap: 8px; padding: 80px 28px; min-height: 40vh; }
    .loading-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent-line, #b2e742); opacity: .4; }
    @media (prefers-reduced-motion: no-preference) {
      .loading-dot { animation: kz-pulse 1.4s var(--ease) infinite; }
      .loading-dot:nth-child(2) { animation-delay: .2s; }
      .loading-dot:nth-child(3) { animation-delay: .4s; }
    }

    /* ── Responsive ──────────────────────────────────────────────────────── */
    @media (max-width: 980px) {
      .cs-hero-grid { grid-template-columns: 1fr; }
      .split { grid-template-columns: 1fr; }
      .gallery { grid-template-columns: 1fr 1fr; }
      .shot.big { grid-column: 1 / -1; grid-row: auto; }
    }
    @media (max-width: 760px) {
      .crumbs, .cs-hero, .cs-body, .state-wrap { padding-left: 18px; padding-right: 18px; }
      .cs-actions .act { flex: 1 1 auto; }
    }
    @media (max-width: 460px) {
      .gallery { grid-template-columns: 1fr; }
      .cs-block { padding: 20px; }
      .fact-metrics { grid-template-columns: 1fr 1fr; }
    }
  `],
})
export class ProjectDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly projectsApi = inject(PortfolioProjectsApiService);
  private readonly theme = inject(PublicThemeService);
  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
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

  readonly isDatabaseEntitiesStory = computed(() => this.project()?.slug === 'story-4-2-database-entities');
  readonly isPublicApiStory = computed(() => this.project()?.slug === 'story-4-3-public-api-endpoints');

  private readonly visibleSections = computed(() =>
    [...(this.project()?.sections ?? [])]
      .filter(section => section.isVisible)
      .sort((left, right) => left.displayOrder - right.displayOrder),
  );
  readonly highlightCards = computed(() =>
    [...(this.project()?.highlightCards ?? [])].sort((left, right) => left.displayOrder - right.displayOrder),
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
        { value: this.formatMetric(project.keyFeatures.length), label: this.copy().metricEntities },
        { value: this.formatMetric(project.architectureNotes.length), label: this.copy().metricRequirements },
        { value: this.formatMetric(project.results.length), label: this.copy().metricAcceptance },
      ];
    }

    if (this.isPublicApiStory()) {
      return [
        { value: this.formatMetric(project.keyFeatures.length), label: this.copy().metricEndpoints },
        { value: this.formatMetric(project.architectureNotes.length), label: this.copy().metricRules },
        { value: this.formatMetric(project.results.length), label: this.copy().metricAcceptance },
      ];
    }

    return [
      { value: this.formatMetric(project.techStack.length), label: this.copy().metricStack },
      { value: this.formatMetric(project.keyFeatures.length), label: this.copy().metricFeatures },
    ];
  });

  readonly heroSignals = computed(() =>
    this.isDatabaseEntitiesStory()
      ? [this.copy().storySignalScope, this.copy().storySignalCodeFirst, this.copy().storySignalReady]
      : this.isPublicApiStory()
        ? [this.copy().apiSignalAnonymous, this.copy().apiSignalDtos, this.copy().apiSignalValidation]
        : [this.copy().heroSignalBusiness, this.copy().heroSignalResponsive, this.copy().heroSignalTheme],
  );

  retry(): void {
    this.reloadVersion.update(value => value + 1);
  }

  sectionLabel(type: number): string {
    return this.visibleSections().find(section => section.type === type)?.label ?? '';
  }

  techAccent(index: number): TechChipAccent {
    return TECH_ACCENTS[index % TECH_ACCENTS.length];
  }

  isGitHubLink(link: PortfolioProjectCaseStudyLink): boolean {
    return /github/i.test(link.url) || /github/i.test(link.label);
  }

  /** Some backend feature strings are formatted as "Title: detail"; split for readability. */
  featureTitle(value: string): string {
    const separatorIndex = value.indexOf(':');
    return separatorIndex >= 0 ? value.slice(0, separatorIndex).trim() : value;
  }

  featureSummary(value: string): string {
    const separatorIndex = value.indexOf(':');
    return separatorIndex >= 0 ? value.slice(separatorIndex + 1).trim() : '';
  }

  constructor() {
    // Content (and its .reveal-item nodes) renders only once a project loads.
    // Re-run the reveal setup whenever the rendered project changes.
    effect(() => {
      if (this.state().kind !== 'ready') return;
      this.project();
      afterNextRender(() => this.setupReveal(), { injector: this.injector });
    });
  }

  private setupReveal(): void {
    const elements = Array.from(
      this.hostEl.nativeElement.querySelectorAll('.reveal-item'),
    ) as HTMLElement[];

    if (typeof IntersectionObserver === 'undefined') {
      elements.forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px -8% 0px' },
    );

    elements.forEach(el => {
      if (!el.classList.contains('revealed')) observer.observe(el);
    });

    /* Safety: guarantee visibility even if the observer never fires */
    setTimeout(() => elements.forEach(el => el.classList.add('revealed')), 1800);
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
}
