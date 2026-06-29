import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  PortfolioExperienceSection,
  PortfolioExperienceTimelineItem,
  PortfolioIdentity,
} from '@features/portfolio/models';
import { PortfolioExperienceApiService } from '@features/portfolio/services/portfolio-experience-api.service';
import { PortfolioHomePageApiService } from '@features/portfolio/services/portfolio-home-page-api.service';
import { getPortfolioCopy } from '@localization/index';
import { PublicThemeService } from '@core/services/public-theme.service';
import { EyebrowBadgeComponent } from '@shared/molecules/eyebrow-badge.component';
import { TagBadgeComponent } from '@shared/atoms/tag-badge.component';
import { TechChipComponent } from '@shared/atoms/tech-chip.component';
import { PortfolioBtnComponent } from '@shared/atoms/portfolio-btn.component';
import { catchError, combineLatest, map, of, startWith } from 'rxjs';

interface ExperiencePageState {
  loading: boolean;
  experience: PortfolioExperienceSection | null;
  identity: PortfolioIdentity | null;
}

interface StrengthChip {
  key: string;
  label: string;
  badgeType: number;
}

const DEFAULT_STRENGTH_CHIPS: StrengthChip[] = [
  { key: 'analytical', label: '', badgeType: 1 },
  { key: 'problem',    label: '', badgeType: 2 },
  { key: 'business',   label: '', badgeType: 3 },
  { key: 'detail',     label: '', badgeType: 4 },
  { key: 'clean',      label: '', badgeType: 5 },
  { key: 'quality',    label: '', badgeType: 6 },
  { key: 'comm',       label: '', badgeType: 7 },
];

const ERP_TECH_CHIPS = ['ASP.NET Core', 'Angular', 'SQL Server', 'EF Core', 'JWT Auth'];

@Component({
  selector: 'app-experience-page',
  standalone: true,
  imports: [EyebrowBadgeComponent, TagBadgeComponent, TechChipComponent, PortfolioBtnComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- ──────────────────────────── LOADING ──────────────────────────────── -->
    @if (state().loading) {
      <div class="page-loading">
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
      </div>
    }

    @if (!state().loading) {

      <!-- ──────────────────────── ABOUT SECTION ────────────────────────── -->
      <section class="about-section" id="about" aria-labelledby="about-heading">
        <div class="about-grid">

          <!-- Left column: copy -->
          <div class="about-copy">
            <div class="reveal-item" data-d="1">
              <app-eyebrow-badge [text]="copy().aboutEyebrow" />
            </div>

            <h1 id="about-heading" class="about-headline reveal-item" data-d="2">
              {{ copy().aboutHeadlinePart1 }}<span class="headline-accent">{{ copy().aboutHeadlineAccent }}</span>{{ copy().aboutHeadlinePart3 }}
            </h1>

            <p class="about-lead reveal-item" data-d="3">
              {{ state().identity?.businessSummary ?? copy().aboutLead }}
            </p>

            <!-- Strength chips -->
            <div class="strengths reveal-item" data-d="4">
              <p class="kicker">{{ copy().strengthsLabel }}</p>
              <div class="chips-row">
                @for (chip of strengthChips(); track chip.key) {
                  <span class="strength-chip">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
                         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      @switch (chip.badgeType) {
                        @case (1) {
                          <!-- target / analytical thinking -->
                          <circle cx="12" cy="12" r="10"/>
                          <circle cx="12" cy="12" r="6"/>
                          <circle cx="12" cy="12" r="2"/>
                        }
                        @case (2) {
                          <!-- lightbulb / problem solving -->
                          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                          <path d="M9 18h6"/><path d="M10 22h4"/>
                        }
                        @case (3) {
                          <!-- briefcase / business understanding -->
                          <rect width="20" height="14" x="2" y="6" rx="2"/>
                          <path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                        }
                        @case (4) {
                          <!-- scan-search / attention to detail -->
                          <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
                          <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                          <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
                          <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
                          <circle cx="12" cy="12" r="3"/>
                          <path d="m16 16-1.9-1.9"/>
                        }
                        @case (5) {
                          <!-- layers / clean architecture -->
                          <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9A1 1 0 0 0 21.4 6.08Z"/>
                          <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/>
                          <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>
                        }
                        @case (6) {
                          <!-- check-circle / quality focus -->
                          <circle cx="12" cy="12" r="10"/>
                          <path d="m9 12 2 2 4-4"/>
                        }
                        @default {
                          <!-- message-square / communication -->
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        }
                      }
                    </svg>
                    {{ chip.label }}
                  </span>
                }
              </div>
            </div>
          </div>

          <!-- Right column: professional summary card -->
          <aside class="summary-card reveal-item" data-d="2" aria-label="Professional summary">
            <div class="sc-inner">
              <!-- Glow overlay -->
              <span class="sc-glow" aria-hidden="true"></span>

              <!-- Header: avatar + name + status -->
              <div class="sc-head">
                <div class="avatar" aria-hidden="true">
                  {{ avatarInitials() }}
                </div>
                <div class="sc-id">
                  <p class="sc-name">{{ state().identity?.fullName ?? 'Kareem Zarif' }}</p>
                  <p class="sc-role">{{ state().identity?.professionalTitle ?? '.NET Full Stack Developer' }}</p>
                </div>
                <span class="sc-status">
                  <span class="status-dot" aria-hidden="true"></span>
                  {{ copy().scStatusAvailable }}
                </span>
              </div>

              <!-- Body -->
              <p class="sc-body">{{ state().identity?.businessSummary ?? copy().scBodyFallback }}</p>

              <div class="sc-divider" aria-hidden="true"></div>

              <!-- Primary facts -->
              <div class="sc-facts">
                <div class="fact-row">
                  <span class="fact-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                  </span>
                  <span class="fact-text">
                    <span class="fact-key">{{ copy().factFocusKey }}</span>
                    <span class="fact-val">{{ copy().factFocusValue }}</span>
                  </span>
                </div>
                <div class="fact-row">
                  <span class="fact-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9A1 1 0 0 0 21.4 6.08Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>
                  </span>
                  <span class="fact-text">
                    <span class="fact-key">{{ copy().factStackKey }}</span>
                    <span class="fact-val">{{ copy().factStackValue }}</span>
                  </span>
                </div>
                <div class="fact-row">
                  <span class="fact-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  </span>
                  <span class="fact-text">
                    <span class="fact-key">{{ copy().factLangKey }}</span>
                    <span class="fact-val">{{ copy().factLangValue }}</span>
                  </span>
                </div>
              </div>

              <div class="sc-divider" aria-hidden="true"></div>

              <!-- Personal facts grid -->
              <div class="sc-facts sc-facts--grid">
                <div class="fact-row">
                  <span class="fact-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  </span>
                  <span class="fact-text">
                    <span class="fact-key">{{ copy().factLocKey }}</span>
                    <span class="fact-val">{{ copy().factLocValue }}</span>
                  </span>
                </div>
                <div class="fact-row">
                  <span class="fact-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  </span>
                  <span class="fact-text">
                    <span class="fact-key">{{ copy().factMartialKey }}</span>
                    <span class="fact-val">{{ copy().factMartialValue }}</span>
                  </span>
                </div>
                <div class="fact-row">
                  <span class="fact-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
                  </span>
                  <span class="fact-text">
                    <span class="fact-key">{{ copy().factMilKey }}</span>
                    <span class="fact-val">{{ copy().factMilValue }}</span>
                  </span>
                </div>
                <div class="fact-row">
                  <span class="fact-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.93 3.4a2 2 0 0 1 1.98-2.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.91 6.91l1.06-1.07a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>
                  </span>
                  <span class="fact-text">
                    <span class="fact-key">{{ copy().factPhoneKey }}</span>
                    <a class="fact-val fact-val--link" [href]="'tel:' + copy().factPhoneValue" dir="ltr">{{ copy().factPhoneValue }}</a>
                  </span>
                </div>
                <div class="fact-row fact-row--span2">
                  <span class="fact-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </span>
                  <span class="fact-text">
                    <span class="fact-key">{{ copy().factEmailKey }}</span>
                    <a class="fact-val fact-val--link" [href]="'mailto:' + copy().factEmailValue" dir="ltr">{{ copy().factEmailValue }}</a>
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <!-- ─────────────────────── EXPERIENCE TIMELINE ───────────────────── -->
      <section class="exp-section" id="experience" aria-labelledby="exp-heading">
        <div class="exp-head">
          <div class="reveal-item" data-d="1">
            <app-eyebrow-badge [text]="copy().expSectionEyebrow" />
          </div>
          <h2 id="exp-heading" class="exp-h2 reveal-item" data-d="2">
            {{ state().experience?.headline ?? copy().expSectionTitle }}
          </h2>
          <p class="exp-sub reveal-item" data-d="3">
            {{ state().experience?.summary ?? copy().expSectionSub }}
          </p>
        </div>

        <div class="timeline" role="list">
          <!-- Primary / featured ERP item first -->
          @if (primaryItem()) {
            <article class="tl-item reveal-item" role="listitem">
              <div class="tl-marker" aria-hidden="true">
                <span class="tl-dot tl-dot--lime">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect width="7" height="9" x="3" y="3" rx="1"/>
                    <rect width="7" height="5" x="14" y="3" rx="1"/>
                    <rect width="7" height="9" x="14" y="12" rx="1"/>
                    <rect width="7" height="5" x="3" y="16" rx="1"/>
                  </svg>
                </span>
              </div>
              <div class="tl-card tl-card--feat">
                <span class="tl-card-glow" aria-hidden="true"></span>
                <div class="tl-top">
                  <app-tag-badge variant="feat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="13" height="13"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    {{ copy().tagPrimary }}
                  </app-tag-badge>
                </div>
                <h3 class="tl-title">{{ primaryItem()!.title }}</h3>
                <p class="tl-org">{{ primaryItem()!.organization || copy().erpOrgLabel }}</p>
                <p class="tl-desc">{{ primaryItem()!.summary }}</p>

                <!-- ERP tech chips -->
                <div class="feat-chips">
                  @for (tech of erpTechChips(); track tech) {
                    <app-tech-chip [label]="tech" accent="lime" />
                  }
                </div>

                <!-- ERP feature grid from highlights -->
                @if (primaryItem()!.highlights?.length) {
                  <div class="feat-grid">
                    @for (h of primaryItem()!.highlights.slice(0, 4); track h) {
                      <span class="feat-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
                          <path d="m9 12 2 2 4-4"/>
                        </svg>
                        {{ h }}
                      </span>
                    }
                  </div>
                } @else {
                  <!-- Fallback feature grid -->
                  <div class="feat-grid">
                    <span class="feat-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
                      {{ copy().fRbac }}
                    </span>
                    <span class="feat-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></svg>
                      {{ copy().fWorkflow }}
                    </span>
                    <span class="feat-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
                      {{ copy().fReport }}
                    </span>
                    <span class="feat-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9A1 1 0 0 0 21.4 6.08Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>
                      {{ copy().fArch }}
                    </span>
                  </div>
                }
              </div>
            </article>
          }

          <!-- Supporting timeline items — newest first (descending order) -->
          @for (item of otherItems(); track item.type; let i = $index) {
            <article class="tl-item reveal-item" role="listitem">
              <div class="tl-marker" aria-hidden="true">
                <span class="tl-dot">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    @switch (timelineDotIcon(item)) {
                      @case ('graduation-cap') {
                        <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/>
                        <path d="M22 10v6"/>
                        <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>
                      }
                      @case ('search-check') {
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                        <path d="m8 11 2 2 4-4"/>
                      }
                      @default {
                        <!-- compass / engineering foundation -->
                        <circle cx="12" cy="12" r="10"/>
                        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
                      }
                    }
                  </svg>
                </span>
              </div>
              <div class="tl-card">
                <div class="tl-top">
                  <span class="tl-step">{{ stepLabel(item) }}</span>
                  <app-tag-badge [variant]="timelineTagVariant(item)">
                    {{ timelineTagLabel(item) }}
                  </app-tag-badge>
                </div>
                <h3 class="tl-title">{{ item.title }}</h3>
                <p class="tl-org">{{ item.organization || item.stageLabel }}</p>
                <p class="tl-desc">{{ item.summary }}</p>
              </div>
            </article>
          }

          <!-- Empty fallback -->
          @if (!primaryItem() && !otherItems().length) {
            <p class="timeline-empty">{{ copy().fallbackSummary }}</p>
          }
        </div>
      </section>

      <!-- ───────────────────────────── CTA BAND ────────────────────────── -->
      <div class="cta-band">
        <div class="cta-inner reveal-item">
          <span class="cta-glow" aria-hidden="true"></span>
          <h2 class="cta-title">{{ copy().ctaTitle }}</h2>
          <p class="cta-desc">{{ copy().ctaDescription }}</p>
          <div class="cta-row">
            <app-portfolio-btn variant="primary" size="lg" routerPath="/projects">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect width="7" height="7" x="3" y="3" rx="1"/>
                <rect width="7" height="7" x="14" y="3" rx="1"/>
                <rect width="7" height="7" x="14" y="14" rx="1"/>
                <rect width="7" height="7" x="3" y="14" rx="1"/>
              </svg>
              {{ copy().ctaViewProjects }}
            </app-portfolio-btn>
            <app-portfolio-btn variant="outline" size="lg" routerPath="/contact">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              {{ copy().ctaContact }}
            </app-portfolio-btn>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* ── Section padding ────────────────────────────────────────────────── */
    :host {
      display: block;
    }

    .about-section,
    .exp-section {
      position: relative;
      z-index: 1;
      max-width: var(--rail, 1180px);
      margin: 0 auto;
      padding: clamp(40px, 6vw, 80px) 28px;
    }

    .exp-section { padding-top: 0; }

    /* ── About grid ─────────────────────────────────────────────────────── */
    .about-grid {
      display: grid;
      grid-template-columns: 1.04fr .96fr;
      gap: clamp(32px, 5vw, 64px);
      align-items: start;
    }

    /* ── About copy ─────────────────────────────────────────────────────── */
    .about-headline {
      margin: 20px 0 0;
      font-size: clamp(2rem, 4.4vw, 3.1rem);
      line-height: 1.07;
      font-weight: 700;
      letter-spacing: -.02em;
      text-wrap: balance;
      color: var(--text, #f4f5f0);
    }

    :host-context([lang="ar"]) .about-headline {
      letter-spacing: 0;
      line-height: 1.22;
    }

    .headline-accent {
      color: var(--accent-text, #b2e742);
      position: relative;
      white-space: nowrap;
    }

    .headline-accent::after {
      content: "";
      position: absolute;
      left: 0; right: 0; bottom: .04em;
      height: .14em;
      background: var(--accent-line, #b2e742);
      opacity: .26;
      border-radius: 4px;
    }

    :host-context([dir="rtl"]) .headline-accent::after {
      left: auto;
      inset-inline-start: 0;
      inset-inline-end: 0;
    }

    .about-lead {
      margin: 20px 0 0;
      max-width: 48ch;
      font-size: clamp(1rem, 1.5vw, 1.1rem);
      line-height: 1.65;
      color: var(--text-muted, #c7c9c2);
      text-wrap: pretty;
    }

    /* ── Strength chips ─────────────────────────────────────────────────── */
    .strengths { margin-top: 28px; }

    .kicker {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: var(--text-faint, #9a9c95);
      margin: 0 0 12px;
    }

    :host-context([lang="ar"]) .kicker { letter-spacing: .03em; }

    .chips-row { display: flex; flex-wrap: wrap; gap: 9px; }

    .strength-chip {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      height: 34px;
      padding: 0 13px;
      border-radius: var(--r-full, 9999px);
      background: var(--chip-bg, #1f1f1f);
      border: 1px solid var(--chip-border, #333);
      font-size: 13px;
      font-weight: 600;
      color: var(--text, #f4f5f0);
      box-shadow: var(--shadow-sm);
      cursor: default;
      transition:
        transform var(--dur-fast, 150ms) var(--ease),
        border-color var(--dur-fast, 150ms) var(--ease);
    }

    .strength-chip:hover {
      transform: translateY(-2px);
      border-color: var(--accent-line, #b2e742);
    }

    .strength-chip svg {
      width: 14px;
      height: 14px;
      color: var(--accent-text, #b2e742);
      flex-shrink: 0;
    }

    /* ── Summary card ───────────────────────────────────────────────────── */
    .summary-card {
      position: relative;
    }

    .sc-inner {
      background: var(--surface, #1e1e1e);
      border: 1px solid var(--border, #2e2e2e);
      border-radius: var(--r-xl, 16px);
      box-shadow: var(--shadow-card);
      padding: 24px;
      position: relative;
      overflow: hidden;
      transition:
        border-color var(--dur, 240ms) var(--ease),
        box-shadow var(--dur, 240ms) var(--ease),
        background var(--dur, 240ms) var(--ease);
    }

    .sc-glow {
      position: absolute;
      inset: 0;
      background: var(--glow);
      opacity: .7;
      pointer-events: none;
    }

    /* Avatar + name row */
    .sc-head {
      display: flex;
      align-items: center;
      gap: 14px;
      position: relative;
    }

    .avatar {
      width: 56px;
      height: 56px;
      border-radius: var(--r-lg, 12px);
      background: var(--gradient-brand);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 20px;
      letter-spacing: .02em;
      box-shadow: var(--shadow-btn);
      flex-shrink: 0;
    }

    .sc-id { display: flex; flex-direction: column; gap: 2px; min-width: 0; }

    .sc-name {
      margin: 0;
      font-size: 17px;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sc-role {
      margin: 0;
      font-size: 13.5px;
      color: var(--text-faint, #9a9c95);
    }

    .sc-status {
      margin-inline-start: auto;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      height: 28px;
      padding: 0 11px;
      border-radius: var(--r-full, 9999px);
      background: rgba(0, 163, 137, .12);
      color: var(--teal, #00a389);
      font-size: 11.5px;
      font-weight: 700;
      white-space: nowrap;
      position: relative;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--teal, #00a389);
    }

    @media (prefers-reduced-motion: no-preference) {
      .status-dot { animation: kz-pulse 2.4s var(--ease) infinite; }
    }

    /* Body & divider */
    .sc-body {
      position: relative;
      margin: 18px 0 0;
      font-size: 14.5px;
      line-height: 1.62;
      color: var(--text-muted, #c7c9c2);
      text-wrap: pretty;
    }

    .sc-divider {
      height: 1px;
      background: var(--border, #2e2e2e);
      margin: 18px 0;
      position: relative;
    }

    /* Facts */
    .sc-facts {
      position: relative;
      display: grid;
      gap: 12px;
    }

    .sc-facts--grid {
      grid-template-columns: 1fr 1fr;
      gap: 12px 18px;
    }

    .sc-facts--grid .fact-row--span2 { grid-column: 1 / -1; }

    .fact-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .fact-icon {
      width: 34px;
      height: 34px;
      border-radius: var(--r, 8px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-2, #1a1a1a);
      border: 1px solid var(--border, #2e2e2e);
      color: var(--accent-text, #b2e742);
      flex-shrink: 0;
    }

    .fact-icon svg { width: 16px; height: 16px; }

    .fact-text { display: flex; flex-direction: column; min-width: 0; }

    .fact-key {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .06em;
      text-transform: uppercase;
      color: var(--text-faint, #9a9c95);
    }

    :host-context([lang="ar"]) .fact-key { letter-spacing: .01em; }

    .fact-val {
      font-size: 14px;
      font-weight: 600;
      color: var(--text, #f4f5f0);
      margin-top: 1px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .fact-val--link {
      color: var(--text, #f4f5f0);
      transition: color var(--dur-fast, 150ms) var(--ease);
    }

    .fact-val--link:hover {
      color: var(--accent-text, #b2e742);
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    /* ── Experience timeline head ───────────────────────────────────────── */
    .exp-head { max-width: 640px; }

    .exp-h2 {
      margin: 18px 0 0;
      font-size: clamp(1.7rem, 3.4vw, 2.4rem);
      font-weight: 700;
      letter-spacing: -.02em;
      line-height: 1.1;
      color: var(--text, #f4f5f0);
    }

    :host-context([lang="ar"]) .exp-h2 { letter-spacing: 0; line-height: 1.28; }

    .exp-sub {
      margin: 12px 0 0;
      font-size: clamp(.98rem, 1.4vw, 1.05rem);
      color: var(--text-muted, #c7c9c2);
      line-height: 1.6;
      max-width: 56ch;
    }

    /* ── Timeline ───────────────────────────────────────────────────────── */
    .timeline {
      margin-top: 40px;
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .timeline::before {
      content: "";
      position: absolute;
      inset-inline-start: 23px;
      top: 14px;
      bottom: 14px;
      width: 2px;
      background: linear-gradient(var(--border, #2e2e2e), var(--border, #2e2e2e) 70%, transparent);
      border-radius: 2px;
    }

    .tl-item {
      position: relative;
      display: grid;
      grid-template-columns: 48px 1fr;
      gap: 18px;
      align-items: start;
    }

    .tl-marker {
      width: 48px;
      display: flex;
      justify-content: center;
    }

    .tl-dot {
      width: 48px;
      height: 48px;
      border-radius: var(--r-full, 9999px);
      background: var(--surface, #1e1e1e);
      border: 1px solid var(--border, #2e2e2e);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-faint, #9a9c95);
      box-shadow: var(--shadow-sm);
      position: relative;
      z-index: 1;
      transition: transform var(--dur, 240ms) var(--ease), color var(--dur, 240ms) var(--ease);
    }

    .tl-dot svg { width: 20px; height: 20px; }

    .tl-item:hover .tl-dot { transform: scale(1.06); color: var(--accent-text, #b2e742); }

    .tl-dot--lime {
      background: var(--gradient-brand);
      color: #fff;
      border-color: rgba(255, 255, 255, .22);
      box-shadow: 0 8px 22px rgba(110, 163, 13, .38);
    }

    .tl-item:hover .tl-dot--lime { color: #fff; }

    /* Timeline cards */
    .tl-card {
      background: var(--surface, #1e1e1e);
      border: 1px solid var(--border, #2e2e2e);
      border-radius: var(--r-lg, 12px);
      padding: 18px 20px;
      box-shadow: var(--shadow-card);
      transition:
        transform var(--dur, 240ms) var(--ease),
        border-color var(--dur, 240ms) var(--ease),
        box-shadow var(--dur, 240ms) var(--ease),
        background var(--dur, 240ms) var(--ease);
    }

    .tl-card:hover {
      transform: translateY(-2px);
      border-color: #cbd5e1;
      box-shadow: var(--shadow-lift);
    }

    :host-context([data-theme="dark"]) .tl-card:hover { border-color: #3a3a3a; }

    /* Featured card */
    .tl-card--feat {
      position: relative;
      overflow: hidden;
      border-color: var(--accent-line, #b2e742);
      box-shadow: var(--shadow-lift);
      padding: 22px 22px 20px;
    }

    .tl-card--feat:hover {
      border-color: var(--accent-line, #b2e742);
    }

    .tl-card-glow {
      position: absolute;
      inset: 0;
      background: var(--accent-soft, rgba(178, 231, 66, .10));
      pointer-events: none;
    }

    .tl-card--feat::after {
      content: "";
      position: absolute;
      inset-inline-start: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: var(--gradient-brand);
    }

    .tl-card--feat > * { position: relative; }

    /* Card internals */
    .tl-top {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .tl-step {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-faint, #9a9c95);
      font-variant-numeric: tabular-nums;
      letter-spacing: .04em;
    }

    .tl-title {
      margin: 12px 0 0;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -.01em;
      color: var(--text, #f4f5f0);
    }

    .tl-card--feat .tl-title { font-size: 21px; }

    .tl-org {
      margin: 3px 0 0;
      font-size: 13px;
      font-weight: 600;
      color: var(--accent-text, #b2e742);
    }

    .tl-desc {
      margin: 10px 0 0;
      font-size: 14px;
      line-height: 1.6;
      color: var(--text-muted, #c7c9c2);
      text-wrap: pretty;
    }

    /* ERP tech chips strip */
    .feat-chips {
      margin-top: 14px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    /* ERP feature grid */
    .feat-grid {
      margin-top: 16px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px 18px;
    }

    .feat-item {
      display: flex;
      align-items: center;
      gap: 9px;
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text, #f4f5f0);
    }

    .feat-item svg {
      width: 16px;
      height: 16px;
      color: var(--dash-green, #537c0f);
      flex-shrink: 0;
    }

    :host-context([data-theme="dark"]) .feat-item svg { color: var(--lime-bright, #b2e742); }

    /* ── CTA band ───────────────────────────────────────────────────────── */
    .cta-band {
      position: relative;
      z-index: 1;
      max-width: var(--rail, 1180px);
      margin: 0 auto clamp(40px, 6vw, 72px);
      padding: 0 28px;
    }

    .cta-inner {
      position: relative;
      overflow: hidden;
      background: var(--surface, #1e1e1e);
      border: 1px solid var(--border, #2e2e2e);
      border-radius: var(--r-xl, 16px);
      box-shadow: var(--shadow-card);
      padding: clamp(32px, 5vw, 52px);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: background var(--dur, 240ms) var(--ease);
    }

    .cta-inner > * { position: relative; }

    .cta-glow {
      position: absolute;
      inset: 0;
      background: var(--glow);
      opacity: .9;
      pointer-events: none;
    }

    .cta-title {
      margin: 0;
      font-size: clamp(1.5rem, 3vw, 2.1rem);
      font-weight: 700;
      letter-spacing: -.02em;
      color: var(--text, #f4f5f0);
    }

    :host-context([lang="ar"]) .cta-title { letter-spacing: 0; }

    .cta-desc {
      margin: 12px 0 0;
      max-width: 50ch;
      color: var(--text-muted, #c7c9c2);
      font-size: clamp(.98rem, 1.4vw, 1.05rem);
      line-height: 1.6;
    }

    .cta-row {
      margin-top: 26px;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: center;
    }

    /* ── Loading state ──────────────────────────────────────────────────── */
    .page-loading {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      padding: 80px 28px;
      min-height: 40vh;
    }

    .loading-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent-line, #b2e742);
      opacity: .4;
    }

    @media (prefers-reduced-motion: no-preference) {
      .loading-dot { animation: kz-pulse 1.4s var(--ease) infinite; }
      .loading-dot:nth-child(2) { animation-delay: .2s; }
      .loading-dot:nth-child(3) { animation-delay: .4s; }
    }

    .timeline-empty {
      font-size: 14px;
      color: var(--text-muted, #c7c9c2);
      padding: 20px 0;
    }

    /* ── Responsive ─────────────────────────────────────────────────────── */
    @media (max-width: 1080px) {
      .about-grid {
        grid-template-columns: 1fr;
        gap: 36px;
      }
      .sc-inner { max-width: 560px; }
    }

    @media (max-width: 760px) {
      .about-section,
      .exp-section { padding-left: 18px; padding-right: 18px; }
      .cta-band { padding-left: 18px; padding-right: 18px; }
      .feat-grid { grid-template-columns: 1fr; }
      .cta-row app-portfolio-btn { flex: 1 1 calc(50% - 12px); }
    }

    @media (max-width: 520px) {
      .timeline::before { inset-inline-start: 19px; }
      .tl-item { grid-template-columns: 40px 1fr; gap: 14px; }
      .tl-marker { width: 40px; }
      .tl-dot { width: 40px; height: 40px; }
      .tl-dot svg { width: 17px; height: 17px; }
      .sc-facts--grid { grid-template-columns: 1fr; }
      .cta-row app-portfolio-btn { flex: 1 1 100%; }
    }
  `],
})
export class ExperiencePageComponent {
  private readonly experienceApi = inject(PortfolioExperienceApiService);
  private readonly homePageApi  = inject(PortfolioHomePageApiService);
  private readonly theme        = inject(PublicThemeService);
  private readonly hostEl       = inject(ElementRef<HTMLElement>);
  private readonly injector     = inject(Injector);

  readonly copy = computed(() => getPortfolioCopy(this.theme.language(), 'experiencePage'));

  readonly state = toSignal(
    combineLatest({
      experience: this.experienceApi.getExperienceSection().pipe(
        catchError(() => of(null)),
      ),
      identity: this.homePageApi.getIdentity().pipe(catchError(() => of(null))),
    }).pipe(
      map(({ experience, identity }) => ({
        loading: false,
        experience,
        identity,
      })),
      startWith({ loading: true, experience: null, identity: null } satisfies ExperiencePageState),
    ),
    { initialValue: { loading: true, experience: null, identity: null } satisfies ExperiencePageState },
  );

  readonly avatarInitials = computed(() => {
    const name = this.state().identity?.fullName ?? 'Kareem Zarif';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  });

  /** Primary (ERP) timeline item */
  readonly primaryItem = computed<PortfolioExperienceTimelineItem | null>(() => {
    const items = this.state().experience?.timelineItems ?? [];
    return items.find(i => i.isPrimaryProfessionalExperience) ?? null;
  });

  /**
   * Non-primary items sorted newest-first (descending displayOrder)
   * so the most recent non-ERP experience appears first.
   */
  readonly otherItems = computed<PortfolioExperienceTimelineItem[]>(() => {
    const items = this.state().experience?.timelineItems ?? [];
    return items
      .filter(i => !i.isPrimaryProfessionalExperience)
      .sort((a, b) => b.displayOrder - a.displayOrder);
  });

  /** Strength chips mapped from API highlight badges or copy fallback */
  readonly strengthChips = computed<StrengthChip[]>(() => {
    const badges = this.state().experience?.highlightBadges ?? [];
    const c = this.copy();

    if (badges.length > 0) {
      return badges
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(b => ({ key: String(b.type), label: b.label, badgeType: b.type }));
    }

    return DEFAULT_STRENGTH_CHIPS.map((chip, i) => ({
      ...chip,
      label: [
        c.strengthAnalytical,
        c.strengthProblemSolving,
        c.strengthBusiness,
        c.strengthAttentionToDetail,
        c.strengthCleanArchitecture,
        c.strengthQualityFocus,
        c.strengthCommunication,
      ][i] ?? chip.key,
    }));
  });

  /** Tech chips for the featured ERP card — from primary item highlights or defaults */
  readonly erpTechChips = computed<string[]>(() => {
    const primary = this.primaryItem();
    if (!primary) return ERP_TECH_CHIPS;
    const highlights = primary.highlights ?? [];
    const techLike = highlights.filter(h =>
      /asp\.net|angular|sql|ef core|entity|jwt|azure/i.test(h),
    );
    return techLike.length >= 3 ? techLike.slice(0, 5) : ERP_TECH_CHIPS;
  });

  /**
   * Step label (01, 02, 03...) based on ascending displayOrder position
   * among non-primary items.
   */
  stepLabel(item: PortfolioExperienceTimelineItem): string {
    const allNonPrimary = (this.state().experience?.timelineItems ?? [])
      .filter(i => !i.isPrimaryProfessionalExperience)
      .sort((a, b) => a.displayOrder - b.displayOrder);
    const idx = allNonPrimary.findIndex(i => i.type === item.type);
    return String(idx + 1).padStart(2, '0');
  }

  timelineDotIcon(item: PortfolioExperienceTimelineItem): string {
    switch (item.type) {
      case 3:  return 'graduation-cap';
      case 2:  return 'search-check';
      default: return 'compass';
    }
  }

  timelineTagVariant(item: PortfolioExperienceTimelineItem): 'neutral' | 'teal' | 'info' | 'indigo' {
    switch (item.type) {
      case 1:  return 'indigo';  // Engineering foundation
      case 2:  return 'info';    // Search Ads Evaluator
      case 3:  return 'teal';    // ITI training
      default: return 'neutral';
    }
  }

  timelineTagLabel(item: PortfolioExperienceTimelineItem): string {
    const c = this.copy();
    switch (item.type) {
      case 1:  return c.tagFoundation;
      case 2:  return c.tagAnalytical;
      case 3:  return c.tagUpskilling;
      default: return item.typeLabel ?? c.tagFoundation;
    }
  }

  constructor() {
    // The content (and all .reveal-item elements) only render once loading
    // flips to false. afterNextRender fires after the FIRST render — while
    // still loading — so we wait for the data, then set up the reveal once.
    const ref = effect(() => {
      if (this.state().loading) return;
      afterNextRender(() => this.setupReveal(), { injector: this.injector });
      ref.destroy();
    });
  }

  private setupReveal(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.hostEl.nativeElement
        .querySelectorAll('.reveal-item')
        .forEach((el: Element) => el.classList.add('revealed'));
      return;
    }

    const elements = Array.from(
      this.hostEl.nativeElement.querySelectorAll('.reveal-item'),
    ) as HTMLElement[];

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

    elements.forEach(el => observer.observe(el));

    /* Safety: guarantee everything is visible even if observer never fires */
    setTimeout(() => elements.forEach(el => el.classList.add('revealed')), 1800);
  }
}
