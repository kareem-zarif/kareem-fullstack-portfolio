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
import { PublicThemeService } from '@core/services/public-theme.service';
import { getPortfolioCopy } from '@localization/index';
import {
  GetPortfolioProjectListInput,
  PortfolioProjectCard,
  PortfolioProjectList,
} from '@features/portfolio/models';
import { PortfolioProjectsApiService } from '@features/portfolio/services/portfolio-projects-api.service';
import { EyebrowBadgeComponent } from '@shared/molecules/eyebrow-badge.component';
import { FilterChipComponent } from '@shared/molecules/filter-chip.component';
import { PortfolioBtnComponent } from '@shared/atoms/portfolio-btn.component';
import {
  ProjectCardComponent,
  ProjectCardCopy,
  ProjectCardIcon,
} from '@shared/organisms/project-card.component';
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

interface ProjectCardView {
  project: PortfolioProjectCard;
  featured: boolean;
  icon: ProjectCardIcon;
  tint: string;
  tintSoft: string;
  tintBorder: string;
}

const INITIAL_STATE: ProjectsPageState = { loading: true, error: false, data: null };

/** Featured / primary card accent. */
const PRIMARY_TINT = { tint: '#6ea30d', tintSoft: 'rgba(110,163,13,.14)', tintBorder: 'rgba(110,163,13,.22)' };

/** Rotating accents for the remaining cards (info, amber, indigo, teal). */
const TINT_PALETTE = [
  { tint: '#0b84b5', tintSoft: 'rgba(11,132,181,.12)', tintBorder: 'rgba(11,132,181,.18)' },
  { tint: '#ff8400', tintSoft: 'rgba(255,132,0,.13)', tintBorder: 'rgba(255,132,0,.2)' },
  { tint: '#4338ca', tintSoft: 'rgba(67,56,202,.14)', tintBorder: 'rgba(67,56,202,.2)' },
  { tint: '#00a389', tintSoft: 'rgba(0,163,137,.12)', tintBorder: 'rgba(0,163,137,.18)' },
];

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [EyebrowBadgeComponent, FilterChipComponent, PortfolioBtnComponent, ProjectCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- ───────────────────────────── LOADING ─────────────────────────────── -->
    @if (pageState().loading && !pageState().data) {
      <div class="page-loading" role="status" [attr.aria-label]="copy().loading">
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
      </div>
    } @else if (pageState().error && !pageState().data) {
      <!-- ───────────────────────────── ERROR ──────────────────────────────── -->
      <section class="section state-section">
        <div class="state-card">
          <h2 class="state-title">{{ copy().errorTitle }}</h2>
          <p class="state-desc">{{ copy().errorDescription }}</p>
        </div>
      </section>
    } @else {

      <!-- ───────────────────────────── PAGE HEADER ─────────────────────────── -->
      <section class="section tight" id="projects" aria-labelledby="projects-heading">
        <div class="proj-head">
          <div class="reveal-item" data-d="1">
            <app-eyebrow-badge [text]="copy().eyebrow" />
          </div>
          <h1 id="projects-heading" class="proj-h1 reveal-item" data-d="2">{{ copy().title }}</h1>
          <p class="proj-sub reveal-item" data-d="3">{{ copy().summary }}</p>
        </div>
      </section>

      <!-- ───────────────────────────── FILTER TOOLBAR ──────────────────────── -->
      <div class="toolbar reveal-item" data-d="4">
        <!-- Focus / project-type row -->
        <div class="filter-row">
          <span class="filter-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9A1 1 0 0 0 21.4 6.08Z" />
              <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" /><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
            </svg>
            <span>{{ copy().filterFocusLabel }}</span>
          </span>
          <div class="chips" role="group" [attr.aria-label]="copy().filterFocusLabel">
            <app-filter-chip
              [label]="copy().filterAll"
              [pressed]="selectedProjectType() === null"
              (select)="setProjectType(null)"
            />
            @for (type of availableProjectTypes(); track type.value) {
              <app-filter-chip
                [label]="type.label"
                [pressed]="selectedProjectType() === type.value"
                (select)="setProjectType(type.value)"
              />
            }
          </div>
        </div>

        <!-- Technology row -->
        @if (availableTechnologies().length) {
          <div class="filter-row">
            <span class="filter-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
              </svg>
              <span>{{ copy().filterTechLabel }}</span>
            </span>
            <div class="chips" role="group" [attr.aria-label]="copy().filterTechLabel">
              <app-filter-chip
                [label]="copy().filterAll"
                [pressed]="selectedTechnology() === null"
                (select)="setTechnology(null)"
              />
              @for (tech of availableTechnologies(); track tech) {
                <app-filter-chip
                  [label]="tech"
                  [pressed]="selectedTechnology() === tech"
                  (select)="setTechnology(tech)"
                />
              }
            </div>
          </div>
        }

        <!-- Footer: result count + clear -->
        <div class="toolbar-foot">
          <span class="result-count">{{ resultPrefix() }}<b>{{ projects().length }}</b>{{ resultSuffix() }}</span>
          @if (hasActiveFilters()) {
            <button type="button" class="clear-btn" (click)="clearFilters()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" />
              </svg>
              <span>{{ copy().clearFilters }}</span>
            </button>
          }
        </div>
      </div>

      <!-- ───────────────────────────── PROJECTS GRID ───────────────────────── -->
      <section class="section proj-section" aria-label="Projects">
        @if (projectViews().length) {
          <div class="proj-grid">
            @for (view of projectViews(); track view.project.id; let i = $index) {
              <div
                class="card-cell reveal-item"
                [class.span-all]="view.featured"
                [attr.data-d]="(i % 4) + 1"
              >
                <app-project-card
                  [project]="view.project"
                  [featured]="view.featured"
                  [icon]="view.icon"
                  [tint]="view.tint"
                  [tintSoft]="view.tintSoft"
                  [tintBorder]="view.tintBorder"
                  [copy]="cardCopy()"
                />
              </div>
            }
          </div>
        } @else {
          <!-- EMPTY STATE -->
          <div class="empty-state">
            <div class="empty-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="m13.5 8.5-5 5" /><path d="m8.5 8.5 5 5" />
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <h3 class="empty-title">{{ copy().emptyTitle }}</h3>
            <p class="empty-desc">{{ copy().emptyDescription }}</p>
            <div class="empty-action">
              <app-portfolio-btn variant="outline" (click)="clearFilters()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M3 2v6h6" /><path d="M3 13a9 9 0 1 0 3-7.7L3 8" />
                </svg>
                {{ copy().clearFilters }}
              </app-portfolio-btn>
            </div>
          </div>
        }
      </section>
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
    .section.tight { padding-top: clamp(24px, 3vw, 40px); padding-bottom: clamp(20px, 3vw, 32px); }
    .proj-section { padding-top: clamp(16px, 2vw, 24px); }

    /* ── Header ──────────────────────────────────────────────────────────── */
    .proj-head { max-width: 720px; }
    .proj-h1 {
      margin: 18px 0 0;
      font-size: clamp(1.7rem, 3.4vw, 2.4rem);
      font-weight: 700;
      letter-spacing: -.02em;
      line-height: 1.1;
      color: var(--text, #f4f5f0);
    }
    :host-context([lang="ar"]) .proj-h1 { letter-spacing: 0; line-height: 1.28; }
    .proj-sub {
      margin: 12px 0 0;
      font-size: clamp(.98rem, 1.4vw, 1.05rem);
      color: var(--text-muted, #c7c9c2);
      line-height: 1.6;
      max-width: 60ch;
      text-wrap: pretty;
    }

    /* ── Filter toolbar ──────────────────────────────────────────────────── */
    .toolbar {
      position: relative;
      z-index: 1;
      max-width: var(--rail, 1180px);
      margin: 0 auto;
      padding: 0 28px clamp(8px, 2vw, 18px);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .filter-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .filter-label {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: .04em;
      text-transform: uppercase;
      color: var(--text-faint, #9a9c95);
      min-width: 64px;
    }
    :host-context([lang="ar"]) .filter-label { letter-spacing: 0; }
    .filter-label svg { width: 14px; height: 14px; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }

    .toolbar-foot {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      padding-top: 14px;
      border-top: 1px solid var(--border-soft, rgba(255,255,255,.06));
    }
    .result-count { font-size: 13px; font-weight: 600; color: var(--text-faint, #9a9c95); font-variant-numeric: tabular-nums; }
    .result-count b { color: var(--accent-text, #b2e742); font-weight: 700; }
    .clear-btn {
      margin-inline-start: auto;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      height: 34px;
      padding: 0 13px;
      border-radius: var(--r-sm, 6px);
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-muted, #c7c9c2);
      font-size: 13px;
      font-weight: 600;
      transition: color var(--dur-fast, 150ms) var(--ease), background var(--dur-fast, 150ms) var(--ease);
    }
    .clear-btn svg { width: 15px; height: 15px; }
    .clear-btn:hover { color: var(--text, #f4f5f0); background: var(--border-soft, rgba(255,255,255,.06)); }

    /* ── Grid ────────────────────────────────────────────────────────────── */
    .proj-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 22px; }
    .card-cell { min-width: 0; }
    .card-cell.span-all { grid-column: 1 / -1; }

    /* ── Empty state ─────────────────────────────────────────────────────── */
    .empty-state { text-align: center; padding: clamp(40px, 7vw, 72px) 20px; }
    .empty-ico {
      width: 64px;
      height: 64px;
      margin: 0 auto;
      border-radius: var(--r-xl, 16px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--accent-soft);
      border: 1px solid var(--chip-border, #333);
      color: var(--accent-text, #b2e742);
    }
    .empty-ico svg { width: 28px; height: 28px; }
    .empty-title { margin-top: 18px; font-size: 1.15rem; font-weight: 700; color: var(--text, #f4f5f0); }
    .empty-desc { margin-top: 8px; font-size: 14px; color: var(--text-muted, #c7c9c2); }
    .empty-action { margin-top: 20px; display: flex; justify-content: center; }

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
    .state-title { margin: 0; font-size: clamp(1.2rem, 2.4vw, 1.5rem); font-weight: 700; color: var(--text, #f4f5f0); }
    .state-desc { margin: 12px 0 0; font-size: 14.5px; line-height: 1.6; color: var(--text-muted, #c7c9c2); }

    .page-loading {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      padding: 80px 28px;
      min-height: 40vh;
    }
    .loading-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent-line, #b2e742); opacity: .4; }
    @media (prefers-reduced-motion: no-preference) {
      .loading-dot { animation: kz-pulse 1.4s var(--ease) infinite; }
      .loading-dot:nth-child(2) { animation-delay: .2s; }
      .loading-dot:nth-child(3) { animation-delay: .4s; }
    }

    /* ── Responsive ──────────────────────────────────────────────────────── */
    @media (max-width: 980px) {
      .proj-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 760px) {
      .section { padding-left: 18px; padding-right: 18px; }
      .toolbar { padding-left: 18px; padding-right: 18px; }
      .filter-label { min-width: 100%; }
    }
  `],
})
export class ProjectsPageComponent {
  private readonly theme = inject(PublicThemeService);
  private readonly projectsApi = inject(PortfolioProjectsApiService);
  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);

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
            return { ...state, loading: true, error: false };
          case 'success':
            return { loading: false, error: false, data: event.data };
          case 'error':
            return { ...state, loading: false, error: true };
        }
      }, INITIAL_STATE),
      startWith(INITIAL_STATE),
    ),
    { initialValue: INITIAL_STATE },
  );

  readonly projects = computed(() => this.pageState().data?.items ?? []);
  readonly availableProjectTypes = computed(() => this.pageState().data?.availableProjectTypes ?? []);
  readonly availableTechnologies = computed(() => this.pageState().data?.availableTechnologies ?? []);
  readonly hasActiveFilters = computed(
    () => this.selectedProjectType() !== null || this.selectedTechnology() !== null,
  );

  /** Card view models: featured first, accent + icon resolved from real data. */
  readonly projectViews = computed<ProjectCardView[]>(() => {
    const items = this.projects();
    const featured = items.find(p => p.isFeatured) ?? items[0] ?? null;

    let paletteIndex = 0;
    return items.map(project => {
      const isFeatured = project === featured;
      const accent = isFeatured ? PRIMARY_TINT : TINT_PALETTE[paletteIndex++ % TINT_PALETTE.length];
      return {
        project,
        featured: isFeatured,
        icon: resolveIcon(project.projectTypeLabel),
        ...accent,
      };
    });
  });

  /** Localized labels handed to every card. */
  readonly cardCopy = computed<ProjectCardCopy>(() => {
    const c = this.copy();
    return {
      featuredBadge: c.featuredBadge,
      businessValueLabel: c.businessValueLabel,
      caseStudy: c.actCaseStudy,
      liveDemo: c.actLiveDemo,
      gitHub: c.viewGitHub,
      technologiesMetric: c.featTechnologies,
      resourcesMetric: c.featResources,
      techStackTitle: c.featTechStack,
    };
  });

  /** "Showing N projects" split so the count keeps its accent styling in both languages. */
  readonly resultPrefix = computed(() => `${this.copy().resultShowing} `);
  readonly resultSuffix = computed(() => ` ${this.copy().resultProjects}`);

  setProjectType(value: number | null): void {
    this.selectedProjectType.set(value);
  }

  setTechnology(value: string | null): void {
    this.selectedTechnology.set(value);
  }

  clearFilters(): void {
    this.selectedProjectType.set(null);
    this.selectedTechnology.set(null);
  }

  private observer?: IntersectionObserver;

  constructor() {
    // Content (and its .reveal-item nodes) only renders once the first load
    // resolves; cards are also re-created whenever filtering swaps the list.
    // Re-observe after every render that changes the displayed cards.
    effect(() => {
      this.projectViews();
      if (this.pageState().loading && !this.pageState().data) return;
      afterNextRender(() => this.observeReveal(), { injector: this.injector });
    });
  }

  private observeReveal(): void {
    const elements = Array.from(
      this.hostEl.nativeElement.querySelectorAll('.reveal-item'),
    ) as HTMLElement[];

    if (typeof IntersectionObserver === 'undefined') {
      elements.forEach(el => el.classList.add('revealed'));
      return;
    }

    this.observer ??= new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            this.observer!.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px -8% 0px' },
    );

    const observer = this.observer;
    elements.forEach(el => {
      if (!el.classList.contains('revealed')) observer.observe(el);
    });

    /* Safety: guarantee visibility even if the observer never fires */
    setTimeout(() => elements.forEach(el => el.classList.add('revealed')), 1800);
  }
}

/** Map a backend project-type label to a card glyph (resilient to enum numbering). */
function resolveIcon(label: string): ProjectCardIcon {
  const value = label.toLowerCase();
  if (/(erp|enterprise|operations|hr)/.test(value)) return 'erp';
  if (/(commerce|shop|store|retail|sales)/.test(value)) return 'ecommerce';
  if (/(portfolio|website|web site)/.test(value)) return 'portfolio';
  if (/(web|app|system|cafeteria|internal)/.test(value)) return 'webapp';
  return 'default';
}
