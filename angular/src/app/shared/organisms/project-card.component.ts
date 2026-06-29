import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioProjectCard } from '@features/portfolio/models';
import { TagBadgeComponent } from '@shared/atoms/tag-badge.component';

/** Icon key resolved from the project type label by the page. */
export type ProjectCardIcon = 'erp' | 'ecommerce' | 'webapp' | 'portfolio' | 'default';

/** Localized labels passed down from the page so the card stays presentation-only. */
export interface ProjectCardCopy {
  featuredBadge: string;
  businessValueLabel: string;
  caseStudy: string;
  liveDemo: string;
  gitHub: string;
  technologiesMetric: string;
  resourcesMetric: string;
  techStackTitle: string;
}

/**
 * Single project case-study card. Renders the standard layout and, when
 * `featured` is set, expands into the two-column spotlight with a real-data
 * metric / tech-stack side board. Repeated for every item in the projects grid.
 */
@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [RouterLink, TagBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="proj-card"
      [class.featured]="featured()"
      [style.--tint]="tint()"
      [style.--tint-soft]="tintSoft()"
      [style.--tint-border]="tintBorder()"
    >
      <div class="feat-main">
        <!-- top meta row -->
        <div class="card-top">
          <span class="proj-type">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              @switch (icon()) {
                @case ('erp') {
                  <rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" />
                  <rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" />
                }
                @case ('ecommerce') {
                  <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                }
                @case ('webapp') {
                  <path d="M3 2v7c0 1.1.9 2 2 2a2 2 0 0 0 2-2V2" /><path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                }
                @case ('portfolio') {
                  <circle cx="12" cy="12" r="10" /><line x1="2" x2="22" y1="12" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                }
                @default {
                  <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9A1 1 0 0 0 21.4 6.08Z" />
                  <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" /><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
                }
              }
            </svg>
            <span>{{ project().projectTypeLabel }}</span>
          </span>

          @if (featured()) {
            <span class="featured-badge">
              <app-tag-badge variant="feat">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                {{ copy().featuredBadge }}
              </app-tag-badge>
            </span>
          }
        </div>

        <h2 class="proj-title">{{ project().title }}</h2>
        <p class="proj-summary">{{ project().shortSummaryPreview || project().shortSummary }}</p>

        <!-- business value strip -->
        @if (project().businessValuePreview || project().businessValue) {
          <div class="value-row">
            <span class="value-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
              </svg>
            </span>
            <div class="value-body">
              <div class="value-label">{{ copy().businessValueLabel }}</div>
              <div class="value-text">{{ project().businessValuePreview || project().businessValue }}</div>
            </div>
          </div>
        }

        <!-- tech stack (standard cards only — featured shows it in the side board) -->
        @if (!featured() && project().techStack.length) {
          <div class="tech-row">
            @for (tech of project().techStack; track tech) {
              <span class="tech">{{ tech }}</span>
            }
          </div>
        }

        <!-- actions -->
        <div class="proj-actions">
          <a [routerLink]="caseStudyRoute()" class="act act-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              <line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" />
            </svg>
            <span>{{ copy().caseStudy }}</span>
          </a>

          @if (project().hasLiveDemoLink && project().liveDemoUrl) {
            <a [href]="project().liveDemoUrl" target="_blank" rel="noopener noreferrer" class="act">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" x2="21" y1="14" y2="3" />
              </svg>
              <span>{{ copy().liveDemo }}</span>
            </a>
          }

          @if (project().hasGitHubLink && project().gitHubUrl) {
            <a [href]="project().gitHubUrl" target="_blank" rel="noopener noreferrer" class="act act-icon" [attr.aria-label]="copy().gitHub">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" />
              </svg>
            </a>
          }
        </div>
      </div>

      <!-- featured side board (real-data metrics + tech stack) -->
      @if (featured()) {
        <aside class="feat-side">
          <div class="feat-metrics">
            <div class="metric">
              <div class="m-num">{{ project().techStack.length }}</div>
              <div class="m-lbl">{{ copy().technologiesMetric }}</div>
            </div>
            <div class="metric">
              <div class="m-num">{{ resourceCount() }}</div>
              <div class="m-lbl">{{ copy().resourcesMetric }}</div>
            </div>
          </div>
          <div class="feat-modules">
            <div class="fm-title">{{ copy().techStackTitle }}</div>
            <ul>
              @for (tech of project().techStack; track tech) {
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{{ tech }}</span>
                </li>
              }
            </ul>
          </div>
        </aside>
      }
    </article>
  `,
  styles: [`
    :host { display: contents; }

    .proj-card {
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: var(--surface, #1e1e1e);
      border: 1px solid var(--border, #2e2e2e);
      border-radius: var(--r-xl, 16px);
      box-shadow: var(--shadow-card);
      padding: 24px;
      height: 100%;
      transition:
        transform var(--dur, 240ms) var(--ease),
        border-color var(--dur, 240ms) var(--ease),
        box-shadow var(--dur, 240ms) var(--ease),
        background var(--dur, 240ms) var(--ease);
    }

    .proj-card:hover { transform: translateY(-4px); border-color: #cbd5e1; box-shadow: var(--shadow-lift); }
    :host-context([data-theme="dark"]) .proj-card:hover { border-color: #3a3a3a; }

    .proj-card::after {
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
    .proj-card:hover::after { opacity: .9; }

    .feat-main { display: flex; flex-direction: column; min-width: 0; flex: 1; }

    /* top meta row */
    .card-top { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .proj-type {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      height: 28px;
      padding: 0 11px;
      border-radius: var(--r-full, 9999px);
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: .02em;
      background: var(--tint-soft, var(--accent-soft));
      color: var(--tint, var(--accent-text));
      border: 1px solid var(--tint-border, transparent);
      white-space: nowrap;
    }
    :host-context([lang="ar"]) .proj-type { letter-spacing: 0; }
    .proj-type svg { width: 14px; height: 14px; flex-shrink: 0; }

    .featured-badge { margin-inline-start: auto; display: inline-flex; }

    .proj-title { font-size: 19px; font-weight: 700; letter-spacing: -.01em; line-height: 1.25; color: var(--text, #f4f5f0); }
    :host-context([lang="ar"]) .proj-title { letter-spacing: 0; }

    .proj-summary {
      margin-top: 9px;
      font-size: 14px;
      color: var(--text-muted, #c7c9c2);
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* business value strip */
    .value-row {
      margin-top: 16px;
      display: flex;
      gap: 11px;
      align-items: flex-start;
      padding: 13px 14px;
      border-radius: var(--r-lg, 12px);
      background: var(--accent-soft);
      border: 1px solid var(--tint-border, var(--chip-border, #333));
    }
    .value-ico {
      width: 30px;
      height: 30px;
      flex-shrink: 0;
      border-radius: var(--r-sm, 6px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface, #1e1e1e);
      border: 1px solid var(--border, #2e2e2e);
      color: var(--tint, var(--accent-text));
    }
    .value-ico svg { width: 16px; height: 16px; }
    .value-body { min-width: 0; }
    .value-label { font-size: 10.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--text-faint, #9a9c95); }
    :host-context([lang="ar"]) .value-label { letter-spacing: 0; }
    .value-text {
      margin-top: 3px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text, #f4f5f0);
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* tech stack */
    .tech-row { margin-top: 16px; display: flex; flex-wrap: wrap; gap: 7px; }
    .tech {
      display: inline-flex;
      align-items: center;
      height: 28px;
      padding: 0 11px;
      border-radius: var(--r-sm, 6px);
      background: var(--chip-bg, #1f1f1f);
      border: 1px solid var(--chip-border, #333);
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted, #c7c9c2);
      white-space: nowrap;
      transition: border-color var(--dur-fast, 150ms) var(--ease), color var(--dur-fast, 150ms) var(--ease);
    }

    /* actions */
    .proj-actions {
      margin-top: 20px;
      padding-top: 18px;
      border-top: 1px solid var(--border-soft, rgba(255,255,255,.06));
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .act {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      height: 40px;
      padding: 0 14px;
      border-radius: var(--r, 8px);
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      background: var(--surface, #1e1e1e);
      border: 1px solid var(--border, #2e2e2e);
      color: var(--text, #f4f5f0);
      box-shadow: var(--shadow-sm);
      transition:
        transform var(--dur-fast, 150ms) var(--ease),
        border-color var(--dur-fast, 150ms) var(--ease),
        background var(--dur-fast, 150ms) var(--ease),
        color var(--dur-fast, 150ms) var(--ease),
        filter var(--dur, 240ms) var(--ease);
    }
    .act svg { width: 16px; height: 16px; }
    .act-icon { width: 40px; padding: 0; }
    .act:hover { border-color: var(--accent-line, #b2e742); transform: translateY(-1px); }
    .act-primary {
      margin-inline-end: auto;
      background: var(--gradient-brand, linear-gradient(94deg, #85bb23 0%, #6ea30d 100%));
      color: #fff;
      border-color: rgba(255, 255, 255, .14);
      box-shadow: var(--shadow-btn);
    }
    .act-primary:hover { filter: brightness(1.07); border-color: rgba(255, 255, 255, .28); }

    /* ── Featured layout ─────────────────────────────────────────────────── */
    .proj-card.featured {
      display: grid;
      grid-template-columns: 1.25fr .9fr;
      gap: 28px;
      align-items: stretch;
      padding: 28px;
      background:
        radial-gradient(120% 120% at 100% 0%, var(--accent-soft), transparent 60%),
        var(--surface, #1e1e1e);
    }
    .featured .proj-title { font-size: clamp(1.35rem, 2.4vw, 1.7rem); }
    .featured .proj-summary { -webkit-line-clamp: 3; line-clamp: 3; font-size: 14.5px; }
    .featured .proj-actions { margin-top: auto; }

    .feat-side { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
    .feat-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .metric { background: var(--surface, #1e1e1e); border: 1px solid var(--border, #2e2e2e); border-radius: var(--r-lg, 12px); padding: 14px 14px 12px; }
    .m-num { font-size: 1.5rem; font-weight: 700; color: var(--accent-text, #b2e742); letter-spacing: -.02em; font-variant-numeric: tabular-nums; line-height: 1; }
    .m-lbl { margin-top: 6px; font-size: 11.5px; font-weight: 600; color: var(--text-faint, #9a9c95); line-height: 1.35; }

    .feat-modules { background: var(--surface, #1e1e1e); border: 1px solid var(--border, #2e2e2e); border-radius: var(--r-lg, 12px); padding: 15px 16px; flex: 1; }
    .fm-title { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--text-faint, #9a9c95); }
    :host-context([lang="ar"]) .fm-title { letter-spacing: 0; }
    .feat-modules ul { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-direction: column; gap: 9px; }
    .feat-modules li { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 500; color: var(--text, #f4f5f0); }
    .feat-modules li svg { width: 16px; height: 16px; color: var(--accent-text, #b2e742); flex-shrink: 0; }

    @media (max-width: 980px) {
      .proj-card.featured { grid-template-columns: 1fr; gap: 22px; }
      .featured .proj-actions { margin-top: 20px; }
    }
    @media (max-width: 460px) {
      .proj-card { padding: 20px; }
      .proj-actions .act:not(.act-primary) { flex: 1; }
      .act-primary { margin-inline-end: 0; flex: 1 1 100%; }
    }
  `],
})
export class ProjectCardComponent {
  readonly project = input.required<PortfolioProjectCard>();
  readonly featured = input(false);
  readonly icon = input<ProjectCardIcon>('default');
  readonly tint = input<string | null>(null);
  readonly tintSoft = input<string | null>(null);
  readonly tintBorder = input<string | null>(null);
  readonly copy = input.required<ProjectCardCopy>();

  /** Case-study route (explicit backend route, falling back to the slug). */
  readonly caseStudyRoute = computed(() => {
    const project = this.project();
    return project.caseStudyRoute || `/projects/${project.slug}`;
  });

  /** Number of real resource links available — drives the featured metric. */
  readonly resourceCount = computed(() => {
    const project = this.project();
    return (
      (project.hasCaseStudyLink ? 1 : 0) +
      (project.hasGitHubLink ? 1 : 0) +
      (project.hasLiveDemoLink ? 1 : 0)
    );
  });
}
