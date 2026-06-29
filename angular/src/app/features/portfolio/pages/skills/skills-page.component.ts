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
import { toSignal } from '@angular/core/rxjs-interop';
import { PortfolioSkillCategoryGroup, PortfolioSkillItem } from '@features/portfolio/models/skills.model';
import { PortfolioSkillsService } from '@features/portfolio/services/portfolio-skills.service';
import { getPortfolioCopy } from '@localization/index';
import { PublicThemeService } from '@core/services/public-theme.service';
import { EyebrowBadgeComponent } from '@shared/molecules/eyebrow-badge.component';
import { PortfolioBtnComponent } from '@shared/atoms/portfolio-btn.component';
import { SkillPillComponent } from '@shared/atoms/skill-pill.component';
import { catchError, map, of, startWith } from 'rxjs';

interface SkillsPageState {
  loading: boolean;
  categories: PortfolioSkillCategoryGroup[] | null;
}

interface SkillCategoryView {
  category: number;
  label: string;
  total: number;
  primaryCount: number;
  skills: PortfolioSkillItem[];
  icon: 'backend' | 'frontend' | 'database' | 'architecture' | 'tools' | 'business' | 'default';
  tint: string;
  tintSoft: string;
  tintBorder: string;
}

interface SkillsMetric {
  value: string;
  label: string;
}

type SkillFilter = 'all' | 'core' | 'supporting';

interface DisplayedCategory extends SkillCategoryView {
  visibleSkills: PortfolioSkillItem[];
}

/** Per-category accent + icon metadata keyed by backend category number. */
const CATEGORY_META: Record<number, Omit<SkillCategoryView, 'category' | 'label' | 'total' | 'primaryCount' | 'skills'>> = {
  1: { icon: 'backend',      tint: '#0b84b5', tintSoft: 'rgba(11,132,181,.12)', tintBorder: 'rgba(11,132,181,.18)' },
  2: { icon: 'frontend',     tint: '#4338ca', tintSoft: 'rgba(67,56,202,.14)',  tintBorder: 'rgba(67,56,202,.2)' },
  3: { icon: 'database',     tint: '#00a389', tintSoft: 'rgba(0,163,137,.12)',  tintBorder: 'rgba(0,163,137,.18)' },
  4: { icon: 'architecture', tint: '#6ea30d', tintSoft: 'rgba(110,163,13,.14)', tintBorder: 'rgba(110,163,13,.22)' },
  5: { icon: 'tools',        tint: '#ff8400', tintSoft: 'rgba(255,132,0,.13)',  tintBorder: 'rgba(255,132,0,.2)' },
  6: { icon: 'business',     tint: '#537c0f', tintSoft: 'rgba(83,124,15,.14)',  tintBorder: 'rgba(83,124,15,.22)' },
};

const DEFAULT_META = { icon: 'default' as const, tint: '#b2e742', tintSoft: 'rgba(178,231,66,.10)', tintBorder: 'rgba(178,231,66,.2)' };

@Component({
  selector: 'app-skills-page',
  standalone: true,
  imports: [EyebrowBadgeComponent, PortfolioBtnComponent, SkillPillComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- ───────────────────────────── LOADING ─────────────────────────────── -->
    @if (pageState().loading) {
      <div class="page-loading" role="status" [attr.aria-label]="copy().loading">
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
      </div>
    } @else if (!categories().length) {
      <!-- ───────────────────────────── ERROR ──────────────────────────────── -->
      <section class="section state-section">
        <div class="state-card">
          <h2 class="state-title">{{ copy().errorTitle }}</h2>
          <p class="state-desc">{{ copy().errorDescription }}</p>
        </div>
      </section>
    } @else {

      <!-- ─────────────────────────── SKILLS HEADER ───────────────────────── -->
      <section class="section" id="skills" aria-labelledby="skills-heading">
        <div class="skills-head">
          <div class="reveal-item" data-d="1">
            <app-eyebrow-badge [text]="copy().eyebrow" />
          </div>
          <h1 id="skills-heading" class="skills-h1 reveal-item" data-d="2">{{ copy().title }}</h1>
          <p class="skills-sub reveal-item" data-d="3">{{ copy().summary }}</p>

          <div class="skill-filter reveal-item" data-d="4" role="group" [attr.aria-label]="copy().filterLabel">
            <button
              type="button"
              class="filter-chip"
              [class.is-active]="skillFilter() === 'all'"
              [attr.aria-pressed]="skillFilter() === 'all'"
              (click)="setFilter('all')"
            >
              <span class="legend-sw legend-sw--all" aria-hidden="true"></span>
              {{ copy().filterAll }}
            </button>
            <button
              type="button"
              class="filter-chip"
              [class.is-active]="skillFilter() === 'core'"
              [attr.aria-pressed]="skillFilter() === 'core'"
              (click)="setFilter('core')"
            >
              <span class="legend-sw legend-sw--core" aria-hidden="true"></span>
              {{ copy().legendCore }}
            </button>
            <button
              type="button"
              class="filter-chip"
              [class.is-active]="skillFilter() === 'supporting'"
              [attr.aria-pressed]="skillFilter() === 'supporting'"
              (click)="setFilter('supporting')"
            >
              <span class="legend-sw legend-sw--std" aria-hidden="true"></span>
              {{ copy().legendSupporting }}
            </button>
          </div>
        </div>

        <!-- ───────────────────────────── MATRIX ───────────────────────────── -->
        <div class="skills-grid">
          @for (cat of displayedCategories(); track cat.category; let i = $index) {
            <article
              class="cat-card reveal-item"
              [attr.data-d]="(i % 6) + 1"
              [style.--tint]="cat.tint"
              [style.--tint-soft]="cat.tintSoft"
              [style.--tint-border]="cat.tintBorder"
            >
              <div class="cat-head">
                <span class="cat-ico" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
                       stroke-linecap="round" stroke-linejoin="round">
                    @switch (cat.icon) {
                      @case ('backend') {
                        <rect width="20" height="8" x="2" y="2" rx="2" /><rect width="20" height="8" x="2" y="14" rx="2" />
                        <line x1="6" x2="6.01" y1="6" y2="6" /><line x1="6" x2="6.01" y1="18" y2="18" />
                      }
                      @case ('frontend') {
                        <rect width="7" height="18" x="3" y="3" rx="1" /><rect width="9" height="7" x="14" y="3" rx="1" />
                        <rect width="9" height="7" x="14" y="14" rx="1" />
                      }
                      @case ('database') {
                        <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" />
                        <path d="M3 12A9 3 0 0 0 21 12" />
                      }
                      @case ('architecture') {
                        <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9A1 1 0 0 0 21.4 6.08Z" />
                        <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" /><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
                      }
                      @case ('tools') {
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                      }
                      @case ('business') {
                        <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /><rect width="20" height="14" x="2" y="6" rx="2" />
                      }
                      @default {
                        <path d="m13 2-3 7h5l-3 7" /><circle cx="12" cy="12" r="10" />
                      }
                    }
                  </svg>
                </span>
                <div class="cat-meta">
                  <span class="cat-title">{{ cat.label }}</span>
                  <span class="cat-count">
                    @if (cat.primaryCount > 0) {
                      <span class="n">{{ cat.primaryCount }}</span> {{ copy().coreLabel }} · <span class="t">{{ cat.total }}</span>
                    } @else {
                      <span class="t">{{ cat.total }}</span> {{ copy().skillsLabel }}
                    }
                  </span>
                </div>
              </div>

              <div class="skill-list">
                @for (skill of cat.visibleSkills; track skill.id) {
                  <app-skill-pill [label]="skill.name" [core]="skill.isPrimary" />
                }
              </div>
            </article>
          }
        </div>

        <!-- ───────────────────────────── SUMMARY STRIP ─────────────────────── -->
        <div class="skill-stats">
          @for (metric of metrics(); track metric.label; let i = $index) {
            <div class="stat reveal-item" [attr.data-d]="i + 1">
              <div class="num">{{ metric.value }}</div>
              <div class="lbl">{{ metric.label }}</div>
            </div>
          }
        </div>
      </section>

      <!-- ───────────────────────────── CTA BAND ───────────────────────────── -->
      <div class="cta-band">
        <div class="cta-inner reveal-item">
          <span class="cta-glow" aria-hidden="true"></span>
          <h2 class="cta-title">{{ copy().ctaTitle }}</h2>
          <p class="cta-desc">{{ copy().ctaDescription }}</p>
          <div class="cta-row">
            <app-portfolio-btn variant="primary" size="lg" routerPath="/projects">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
              {{ copy().ctaViewProjects }}
            </app-portfolio-btn>
            <app-portfolio-btn variant="outline" size="lg" routerPath="/contact">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              {{ copy().ctaContact }}
            </app-portfolio-btn>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

    .section {
      position: relative;
      z-index: 1;
      max-width: var(--rail, 1180px);
      margin: 0 auto;
      padding: clamp(40px, 6vw, 80px) 28px;
    }

    /* ── Header ──────────────────────────────────────────────────────────── */
    .skills-head { max-width: 700px; }

    .skills-h1 {
      margin: 18px 0 0;
      font-size: clamp(1.7rem, 3.4vw, 2.4rem);
      font-weight: 700;
      letter-spacing: -.02em;
      line-height: 1.1;
      color: var(--text, #f4f5f0);
    }

    :host-context([lang="ar"]) .skills-h1 { letter-spacing: 0; line-height: 1.28; }

    .skills-sub {
      margin: 12px 0 0;
      font-size: clamp(.98rem, 1.4vw, 1.05rem);
      color: var(--text-muted, #c7c9c2);
      line-height: 1.6;
      max-width: 58ch;
      text-wrap: pretty;
    }

    /* ── Filter (was legend) ─────────────────────────────────────────────── */
    .skill-filter {
      margin-top: 22px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
    }

    .filter-chip {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      height: 38px;
      padding: 0 15px;
      border-radius: var(--r-full, 9999px);
      background: transparent;
      border: 1px solid var(--border, #2e2e2e);
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted, #c7c9c2);
      cursor: pointer;
      transition:
        transform var(--dur-fast, 150ms) var(--ease),
        border-color var(--dur-fast, 150ms) var(--ease),
        background var(--dur-fast, 150ms) var(--ease),
        color var(--dur-fast, 150ms) var(--ease),
        box-shadow var(--dur-fast, 150ms) var(--ease);
    }

    .filter-chip:hover {
      border-color: var(--accent-line, #b2e742);
      color: var(--text, #f4f5f0);
    }

    .filter-chip:active { transform: scale(.97); }

    .filter-chip.is-active {
      background: var(--surface, #1e1e1e);
      border-color: var(--accent-line, #b2e742);
      color: var(--text, #f4f5f0);
      box-shadow: var(--shadow-sm);
    }

    .legend-sw {
      width: 28px;
      height: 18px;
      border-radius: var(--r-full, 9999px);
      flex-shrink: 0;
    }

    .legend-sw--all {
      background: linear-gradient(to right, var(--olive, #6ea30d) 0 50%, var(--chip-bg, #1f1f1f) 50% 100%);
      border: 1px solid var(--chip-border, #333);
    }

    :host-context([dir="rtl"]) .legend-sw--all {
      background: linear-gradient(to left, var(--olive, #6ea30d) 0 50%, var(--chip-bg, #1f1f1f) 50% 100%);
    }

    .legend-sw--core {
      background: var(--gradient-brand);
      box-shadow: 0 2px 8px rgba(110, 163, 13, .35);
    }

    .legend-sw--std {
      background: var(--chip-bg, #1f1f1f);
      border: 1px solid var(--chip-border, #333);
    }

    /* ── Matrix grid ─────────────────────────────────────────────────────── */
    .skills-grid {
      margin-top: 40px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
      gap: 20px;
    }

    .cat-card {
      position: relative;
      overflow: hidden;
      background: var(--surface, #1e1e1e);
      border: 1px solid var(--border, #2e2e2e);
      border-radius: var(--r-xl, 16px);
      box-shadow: var(--shadow-card);
      padding: 22px 22px 24px;
      transition:
        transform var(--dur, 240ms) var(--ease),
        border-color var(--dur, 240ms) var(--ease),
        box-shadow var(--dur, 240ms) var(--ease),
        background var(--dur, 240ms) var(--ease);
    }

    .cat-card:hover {
      transform: translateY(-3px);
      border-color: #cbd5e1;
      box-shadow: var(--shadow-lift);
    }

    :host-context([data-theme="dark"]) .cat-card:hover { border-color: #3a3a3a; }

    .cat-card::after {
      content: "";
      position: absolute;
      inset-inline-start: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: var(--tint, var(--accent-line));
      opacity: 0;
      transition: opacity var(--dur, 240ms) var(--ease);
    }

    .cat-card:hover::after { opacity: .9; }

    .cat-head {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .cat-ico {
      width: 46px;
      height: 46px;
      border-radius: var(--r-lg, 12px);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--tint-soft, var(--accent-soft));
      color: var(--tint, var(--accent-text));
      border: 1px solid var(--tint-border, transparent);
      transition: transform var(--dur, 240ms) var(--ease);
    }

    .cat-card:hover .cat-ico { transform: scale(1.06); }
    .cat-ico svg { width: 22px; height: 22px; }

    .cat-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .cat-title {
      font-size: 16.5px;
      font-weight: 700;
      letter-spacing: -.01em;
      color: var(--text, #f4f5f0);
    }

    .cat-count {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-faint, #9a9c95);
      font-variant-numeric: tabular-nums;
    }

    .skill-list {
      margin-top: 18px;
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
    }

    /* ── Summary strip ───────────────────────────────────────────────────── */
    .skill-stats {
      margin-top: 30px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }

    .stat {
      background: var(--surface, #1e1e1e);
      border: 1px solid var(--border, #2e2e2e);
      border-radius: var(--r-lg, 12px);
      padding: 18px 18px 16px;
      box-shadow: var(--shadow-card);
      transition:
        transform var(--dur, 240ms) var(--ease),
        border-color var(--dur, 240ms) var(--ease),
        box-shadow var(--dur, 240ms) var(--ease);
    }

    .stat:hover {
      transform: translateY(-2px);
      border-color: #cbd5e1;
      box-shadow: var(--shadow-lift);
    }

    :host-context([data-theme="dark"]) .stat:hover { border-color: #3a3a3a; }

    .stat .num {
      font-size: clamp(1.6rem, 3vw, 2rem);
      font-weight: 700;
      color: var(--accent-text, #b2e742);
      letter-spacing: -.02em;
      font-variant-numeric: tabular-nums;
      line-height: 1;
    }

    .stat .lbl {
      margin-top: 8px;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text-faint, #9a9c95);
    }

    /* ── CTA band ────────────────────────────────────────────────────────── */
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

    /* ── States ──────────────────────────────────────────────────────────── */
    .state-section { padding-top: clamp(48px, 8vw, 96px); }

    .state-card {
      background: var(--surface, #1e1e1e);
      border: 1px solid var(--border, #2e2e2e);
      border-radius: var(--r-xl, 16px);
      box-shadow: var(--shadow-card);
      padding: clamp(28px, 5vw, 48px);
      max-width: 560px;
    }

    .state-title {
      margin: 0;
      font-size: clamp(1.2rem, 2.4vw, 1.5rem);
      font-weight: 700;
      color: var(--text, #f4f5f0);
    }

    .state-desc {
      margin: 12px 0 0;
      font-size: 14.5px;
      line-height: 1.6;
      color: var(--text-muted, #c7c9c2);
    }

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

    /* ── Reveal: extra stagger slots + in-card skill stagger ─────────────── */
    @media (prefers-reduced-motion: no-preference) {
      .reveal-item[data-d="5"] { transition-delay: .35s; }
      .reveal-item[data-d="6"] { transition-delay: .42s; }

      .cat-card.revealed app-skill-pill { animation: kz-skill-in .42s var(--ease) backwards; }
      .cat-card.revealed app-skill-pill:nth-child(1) { animation-delay: .04s; }
      .cat-card.revealed app-skill-pill:nth-child(2) { animation-delay: .08s; }
      .cat-card.revealed app-skill-pill:nth-child(3) { animation-delay: .12s; }
      .cat-card.revealed app-skill-pill:nth-child(4) { animation-delay: .16s; }
      .cat-card.revealed app-skill-pill:nth-child(5) { animation-delay: .20s; }
      .cat-card.revealed app-skill-pill:nth-child(6) { animation-delay: .24s; }
      .cat-card.revealed app-skill-pill:nth-child(7) { animation-delay: .28s; }
      .cat-card.revealed app-skill-pill:nth-child(8) { animation-delay: .32s; }
    }

    @keyframes kz-skill-in {
      from { opacity: 0; transform: translateY(8px); }
    }

    /* ── Responsive ──────────────────────────────────────────────────────── */
    @media (max-width: 980px) {
      .skill-stats { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 760px) {
      .section { padding-left: 18px; padding-right: 18px; }
      .cta-band { padding-left: 18px; padding-right: 18px; }
      .skills-grid { grid-template-columns: 1fr; }
      .cta-row app-portfolio-btn { flex: 1 1 calc(50% - 12px); }
    }

    @media (max-width: 460px) {
      .skill-stats { grid-template-columns: 1fr 1fr; gap: 10px; }
      .cta-row app-portfolio-btn { flex: 1 1 100%; }
    }
  `],
})
export class SkillsPageComponent {
  private readonly skillsService = inject(PortfolioSkillsService);
  private readonly theme = inject(PublicThemeService);
  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);

  readonly copy = computed(() => getPortfolioCopy(this.theme.language(), 'skillsPage'));

  readonly pageState = toSignal(
    this.skillsService.getSkillCategories().pipe(
      map(categories => ({ loading: false, categories })),
      startWith({ loading: true, categories: null }),
      catchError(() => of({ loading: false, categories: null })),
    ),
    { initialValue: { loading: true, categories: null } as SkillsPageState },
  );

  readonly categories = computed(() => this.pageState().categories ?? []);

  /** Category cards with accent metadata, core skills sorted first. */
  readonly categoryViews = computed<SkillCategoryView[]>(() =>
    this.categories().map(category => {
      const meta = CATEGORY_META[category.category] ?? DEFAULT_META;
      const skills = [...category.skills].sort((a, b) => {
        if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
        return a.displayOrder - b.displayOrder;
      });
      return {
        category: category.category,
        label: category.categoryLabel,
        total: skills.length,
        primaryCount: skills.filter(s => s.isPrimary).length,
        skills,
        ...meta,
      };
    }),
  );

  /** Active legend filter: All / Core / Supporting. */
  readonly skillFilter = signal<SkillFilter>('all');

  setFilter(filter: SkillFilter): void {
    this.skillFilter.set(filter);
  }

  /** Categories with skills narrowed to the active filter; empty cards dropped. */
  readonly displayedCategories = computed<DisplayedCategory[]>(() => {
    const filter = this.skillFilter();
    return this.categoryViews()
      .map(cat => ({
        ...cat,
        visibleSkills: cat.skills.filter(skill =>
          filter === 'all' ? true : filter === 'core' ? skill.isPrimary : !skill.isPrimary,
        ),
      }))
      .filter(cat => cat.visibleSkills.length > 0);
  });

  readonly metrics = computed<SkillsMetric[]>(() => {
    const categories = this.categories();
    const totalSkills = categories.reduce((sum, c) => sum + c.skills.length, 0);
    const totalPrimary = categories.reduce((sum, c) => sum + c.skills.filter(s => s.isPrimary).length, 0);
    const c = this.copy();

    return [
      { value: String(categories.length), label: c.statCategories },
      { value: String(totalPrimary), label: c.statCore },
      { value: String(totalSkills), label: c.statTotal },
      { value: c.statFocusValue, label: c.statFocus },
    ];
  });

  constructor() {
    // Content (and its .reveal-item nodes) only renders once loading flips to
    // false, so wait for data, then wire the scroll reveal exactly once.
    const ref = effect(() => {
      if (this.pageState().loading) return;
      afterNextRender(() => this.setupReveal(), { injector: this.injector });
      ref.destroy();
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

    elements.forEach(el => observer.observe(el));

    /* Safety: guarantee visibility even if the observer never fires */
    setTimeout(() => elements.forEach(el => el.classList.add('revealed')), 1800);
  }
}
