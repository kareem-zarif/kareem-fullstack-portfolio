import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { PublicThemeService } from '@core/services/public-theme.service';
import { getPortfolioCopy } from '@localization/index';
import {
  AdminDashboardMetric,
  AdminDashboardOverview,
  AdminDashboardQuickAction,
} from '@features/admin/models';
import { AdminDashboardFacade } from '@features/admin/services/admin-dashboard.facade';
import { catchError, map, of, scan, startWith, switchMap } from 'rxjs';

interface DashboardPageState {
  loading: boolean;
  error: boolean;
  data: AdminDashboardOverview | null;
}

type DashboardPageEvent =
  | { kind: 'loading' }
  | { kind: 'success'; data: AdminDashboardOverview }
  | { kind: 'error' };

interface DashboardHeroStat {
  value: string;
  label: string;
}

const DASHBOARD_METRIC = {
  totalProjects: 1,
  totalSkills: 2,
  totalContactMessages: 3,
  unreadMessages: 4,
} as const;

const INITIAL_STATE: DashboardPageState = {
  loading: true,
  error: false,
  data: null,
};

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard-page">
      <section class="surface hero" aria-labelledby="admin-dashboard-title">
        <div class="hero__copy">
          <div class="hero__header">
            <p class="eyebrow">{{ copy().eyebrow }}</p>
            <span class="story-badge">{{ copy().storyBadge }}</span>
          </div>

          <h1 id="admin-dashboard-title">{{ copy().title }}</h1>
          <p class="hero__summary">{{ copy().summary }}</p>

          <div class="hero__signals" [attr.aria-label]="copy().signalsLabel">
            <span>{{ copy().signalRealData }}</span>
            <span>{{ copy().signalResponsive }}</span>
            <span>{{ copy().signalTheme }}</span>
          </div>

          <dl class="hero__stats">
            @for (stat of heroStats(); track stat.label) {
              <div class="hero-stat">
                <dt>{{ stat.value }}</dt>
                <dd>{{ stat.label }}</dd>
              </div>
            }
          </dl>
        </div>

        <article class="hero-panel">
          <div class="hero-panel__eyebrow">
            <span class="eyebrow">{{ copy().overviewEyebrow }}</span>
            <span class="hero-panel__live">{{ copy().liveBadge }}</span>
          </div>

          @if (pageState().data; as overview) {
            <h2>{{ copy().overviewTitle }}</h2>
            <p>{{ copy().overviewDescription }}</p>

            <dl class="hero-panel__facts">
              <div>
                <dt>{{ copy().generatedLabel }}</dt>
                <dd>{{ formatDateTime(overview.generatedAtUtc) }}</dd>
              </div>
              <div>
                <dt>{{ copy().actionsCountLabel }}</dt>
                <dd>{{ formatCount(overview.quickActions.length) }}</dd>
              </div>
              <div>
                <dt>{{ copy().messagesCountLabel }}</dt>
                <dd>{{ formatCount(overview.recentMessages.length) }}</dd>
              </div>
            </dl>

            <div class="hero-panel__footer">
              <span class="status-pill" [class.status-pill--alert]="unreadCount() > 0">
                {{ unreadCount() > 0 ? copy().unreadSummary : copy().allCaughtUp }}
              </span>

              <a routerLink="/admin/messages" class="button button--secondary">
                {{ copy().openInbox }}
              </a>
            </div>
          } @else if (pageState().loading) {
            <h2>{{ copy().loading }}</h2>
            <p>{{ copy().loadingDescription }}</p>
            <div class="skeleton-grid" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>
          } @else {
            <h2>{{ copy().errorTitle }}</h2>
            <p>{{ copy().errorDescription }}</p>
            <button type="button" class="button button--primary" (click)="retry()">
              {{ copy().retry }}
            </button>
          }
        </article>
      </section>

      @if (pageState().error && pageState().data) {
        <section class="state-card state-card--warning" role="status">
          <strong>{{ copy().warningTitle }}</strong>
          <p>{{ copy().warningDescription }}</p>
        </section>
      }

      @if (pageState().data; as overview) {
        <section class="metrics-grid" [attr.aria-label]="copy().metricsAriaLabel">
          @for (metric of overview.metrics; track metric.type; let index = $index) {
            <article class="metric-card" [style.--item-index]="index">
              <div class="metric-card__topline">
                <span class="metric-card__icon">{{ metricIcon(metric) }}</span>
                <span class="metric-card__type">{{ metric.label }}</span>
              </div>

              <strong>{{ formatCount(metric.value) }}</strong>
              <p>{{ metricContext(metric) }}</p>
            </article>
          }
        </section>

        <section class="content-grid">
          <article class="surface panel">
            <div class="panel__header">
              <div class="section-copy">
                <p class="eyebrow">{{ copy().quickActionsEyebrow }}</p>
                <h2>{{ copy().quickActionsTitle }}</h2>
                <p>{{ copy().quickActionsDescription }}</p>
              </div>
            </div>

            @if (overview.quickActions.length) {
              <div class="actions-grid">
                @for (action of overview.quickActions; track action.path; let index = $index) {
                  <a
                    [routerLink]="action.path"
                    class="action-card"
                    [style.--item-index]="index"
                  >
                    <div class="action-card__header">
                      <span class="action-card__icon">{{ quickActionIcon(action) }}</span>
                      <span class="action-card__cta">{{ copy().openSection }}</span>
                    </div>

                    <strong>{{ action.label }}</strong>
                    <p>{{ quickActionDescription(action) }}</p>
                  </a>
                }
              </div>
            } @else {
              <div class="empty-state">
                <strong>{{ copy().quickActionsEmptyTitle }}</strong>
                <p>{{ copy().quickActionsEmptyDescription }}</p>
              </div>
            }
          </article>

          <article class="surface panel">
            <div class="panel__header">
              <div class="section-copy">
                <p class="eyebrow">{{ copy().messagesEyebrow }}</p>
                <h2>{{ copy().messagesTitle }}</h2>
                <p>{{ copy().messagesDescription }}</p>
              </div>
            </div>

            @if (overview.recentMessages.length) {
              <div class="messages-list">
                @for (message of overview.recentMessages; track message.id; let index = $index) {
                  <article class="message-card" [style.--item-index]="index">
                    <div class="message-card__header">
                      <div class="message-card__identity">
                        <strong>{{ message.subject }}</strong>
                        <span>{{ message.name }}</span>
                      </div>

                      <span class="status-pill" [class.status-pill--alert]="!message.isRead">
                        {{ message.isRead ? copy().readBadge : copy().unreadBadge }}
                      </span>
                    </div>

                    <p>{{ message.messagePreview }}</p>

                    <dl class="message-card__meta">
                      <div>
                        <dt>{{ copy().emailLabel }}</dt>
                        <dd>
                          <a [href]="'mailto:' + message.email">{{ message.email }}</a>
                        </dd>
                      </div>

                      <div>
                        <dt>{{ copy().companyLabel }}</dt>
                        <dd>{{ message.company || copy().companyFallback }}</dd>
                      </div>

                      <div>
                        <dt>{{ copy().receivedLabel }}</dt>
                        <dd>{{ formatDateTime(message.creationTime) }}</dd>
                      </div>
                    </dl>
                  </article>
                }
              </div>
            } @else {
              <div class="empty-state">
                <strong>{{ copy().messagesEmptyTitle }}</strong>
                <p>{{ copy().messagesEmptyDescription }}</p>
              </div>
            }
          </article>
        </section>
      } @else if (pageState().loading) {
        <section class="surface loading-surface" aria-busy="true">
          <div class="loading-surface__header">
            <strong>{{ copy().loading }}</strong>
            <p>{{ copy().loadingDescription }}</p>
          </div>
          <div class="loading-surface__grid">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </section>
      } @else {
        <section class="state-card state-card--error" role="alert">
          <strong>{{ copy().errorTitle }}</strong>
          <p>{{ copy().errorDescription }}</p>
          <button type="button" class="button button--primary" (click)="retry()">
            {{ copy().retry }}
          </button>
        </section>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .dashboard-page {
        display: grid;
        gap: clamp(1rem, 2.8vw, 1.8rem);
        padding-block: 0.2rem 1rem;
      }

      .surface,
      .state-card,
      .metric-card,
      .action-card,
      .message-card,
      .hero-stat {
        border: 1px solid var(--admin-border);
        box-shadow: var(--admin-shadow);
      }

      .surface,
      .state-card {
        position: relative;
        overflow: hidden;
        display: grid;
        gap: 1.5rem;
        padding: clamp(1.2rem, 3vw, 2rem);
        border-radius: 2rem;
        background: color-mix(in srgb, var(--admin-panel) 92%, transparent);
        backdrop-filter: blur(16px);
      }

      .hero {
        grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
        align-items: stretch;
        min-height: min(680px, calc(100vh - 8.75rem));
      }

      .hero__copy,
      .hero-panel,
      .panel,
      .section-copy,
      .message-card,
      .empty-state,
      .state-card,
      .loading-surface__header {
        display: grid;
        gap: 1rem;
      }

      .hero__copy {
        align-content: center;
      }

      .hero__header,
      .hero-panel__eyebrow,
      .metric-card__topline,
      .panel__header,
      .action-card__header,
      .message-card__header,
      .hero-panel__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      .eyebrow,
      .metric-card__type,
      .action-card__cta,
      .story-badge,
      .hero-panel__live {
        margin: 0;
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      .eyebrow {
        color: var(--admin-accent);
      }

      .story-badge,
      .hero-panel__live,
      .status-pill,
      .hero__signals span {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        border: 1px solid var(--admin-border);
        padding: 0.5rem 0.8rem;
        background: color-mix(in srgb, var(--admin-panel-soft) 82%, transparent);
        color: var(--admin-text);
      }

      .story-badge,
      .hero-panel__live {
        color: var(--admin-primary);
      }

      h1,
      h2,
      strong,
      p,
      dl,
      dt,
      dd {
        margin: 0;
      }

      h1,
      h2,
      strong,
      dt,
      dd,
      .message-card__meta a,
      .action-card {
        color: var(--admin-text);
      }

      p,
      .hero__signals span,
      .hero-stat dd,
      .metric-card p,
      .action-card__cta,
      .message-card__identity span,
      .message-card__meta dt {
        color: var(--admin-muted);
        line-height: 1.7;
      }

      h1 {
        max-width: 12ch;
        font-size: clamp(2.4rem, 5vw, 4.8rem);
        line-height: 0.96;
        text-wrap: balance;
      }

      h2 {
        font-size: clamp(1.3rem, 2.2vw, 1.8rem);
        line-height: 1.15;
        text-wrap: balance;
      }

      .hero__summary {
        max-width: 58rem;
        font-size: clamp(1rem, 1.4vw, 1.08rem);
      }

      .hero__signals {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .hero__stats,
      .metrics-grid,
      .content-grid,
      .actions-grid,
      .messages-list,
      .skeleton-grid,
      .loading-surface__grid {
        display: grid;
        gap: 1rem;
      }

      .hero__stats {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .hero-stat {
        padding: 1rem 1.05rem;
        border-radius: 1.35rem;
        background: color-mix(in srgb, var(--admin-panel-soft) 72%, transparent);
      }

      .hero-stat dt {
        font-size: clamp(1.3rem, 2.7vw, 1.85rem);
        font-weight: 800;
      }

      .hero-stat dd {
        margin-block-start: 0.2rem;
        font-size: 0.9rem;
      }

      .hero-panel {
        align-content: center;
        padding: clamp(1.2rem, 3vw, 1.7rem);
        border-radius: 1.8rem;
        background:
          linear-gradient(
            150deg,
            color-mix(in srgb, var(--admin-primary) 18%, transparent),
            transparent 60%
          ),
          color-mix(in srgb, var(--admin-panel-soft) 88%, transparent);
      }

      .hero-panel__facts {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.85rem;
      }

      .hero-panel__facts div {
        padding: 0.95rem 1rem;
        border-radius: 1.2rem;
        border: 1px solid var(--admin-border);
        background: color-mix(in srgb, var(--admin-panel) 84%, transparent);
      }

      .hero-panel__facts dt {
        font-size: 0.76rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--admin-muted);
      }

      .hero-panel__facts dd {
        margin-block-start: 0.35rem;
        font-size: 1rem;
        font-weight: 700;
      }

      .status-pill {
        font-size: 0.82rem;
        font-weight: 700;
      }

      .status-pill--alert {
        border-color: color-mix(in srgb, var(--admin-accent) 30%, var(--admin-border));
        background: color-mix(in srgb, var(--admin-accent) 12%, transparent);
        color: var(--admin-accent);
      }

      .metrics-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .metric-card {
        padding: 1.15rem;
        border-radius: 1.55rem;
        background: color-mix(in srgb, var(--admin-panel-soft) 82%, transparent);
        display: grid;
        gap: 0.95rem;
      }

      .metric-card__icon,
      .action-card__icon {
        width: 2.8rem;
        height: 2.8rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 1rem;
        background: linear-gradient(
          135deg,
          color-mix(in srgb, var(--admin-primary) 92%, white 8%),
          color-mix(in srgb, var(--admin-accent) 72%, var(--admin-primary))
        );
        color: var(--admin-primary-contrast);
        font-size: 1.15rem;
      }

      .metric-card strong {
        font-size: clamp(1.8rem, 4vw, 2.5rem);
        line-height: 1;
      }

      .content-grid {
        grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
      }

      .actions-grid,
      .messages-list {
        align-content: start;
      }

      .action-card {
        text-decoration: none;
        padding: 1.1rem;
        border-radius: 1.4rem;
        background: color-mix(in srgb, var(--admin-panel-soft) 78%, transparent);
        display: grid;
        gap: 0.8rem;
        transition:
          transform 180ms ease,
          border-color 180ms ease,
          background 180ms ease;
      }

      .action-card:hover,
      .action-card:focus-visible,
      .button:hover,
      .button:focus-visible {
        transform: translateY(-2px);
      }

      .action-card:hover,
      .action-card:focus-visible {
        border-color: color-mix(in srgb, var(--admin-primary) 28%, var(--admin-border));
        background: color-mix(in srgb, var(--admin-primary) 8%, var(--admin-panel-soft));
      }

      .action-card strong {
        font-size: 1.05rem;
      }

      .messages-list {
        gap: 0.9rem;
      }

      .message-card {
        padding: 1rem 1.05rem;
        border-radius: 1.35rem;
        background: color-mix(in srgb, var(--admin-panel-soft) 76%, transparent);
      }

      .message-card__identity {
        display: grid;
        gap: 0.2rem;
      }

      .message-card__identity strong {
        font-size: 1rem;
      }

      .message-card__meta {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.8rem;
        padding-top: 0.2rem;
      }

      .message-card__meta div {
        display: grid;
        gap: 0.3rem;
        min-width: 0;
      }

      .message-card__meta dt {
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .message-card__meta dd,
      .message-card__meta a {
        font-size: 0.92rem;
        overflow-wrap: anywhere;
      }

      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.55rem;
        min-height: 3rem;
        border: 1px solid transparent;
        border-radius: 999px;
        padding: 0.82rem 1.15rem;
        font-weight: 800;
        font-size: 0.95rem;
        text-decoration: none;
        cursor: pointer;
        transition:
          transform 180ms ease,
          border-color 180ms ease,
          background 180ms ease,
          color 180ms ease,
          opacity 180ms ease;
      }

      .button:disabled {
        cursor: not-allowed;
        opacity: 0.55;
        transform: none;
      }

      .button--primary {
        background: linear-gradient(
          135deg,
          var(--admin-primary),
          color-mix(in srgb, var(--admin-primary) 68%, var(--admin-accent))
        );
        color: var(--admin-primary-contrast);
      }

      .button--secondary {
        border-color: color-mix(in srgb, var(--admin-primary) 26%, var(--admin-border));
        background: color-mix(in srgb, var(--admin-primary) 10%, transparent);
        color: var(--admin-primary);
      }

      .empty-state,
      .state-card,
      .loading-surface {
        min-height: 14rem;
        align-content: center;
      }

      .state-card {
        text-align: center;
        justify-items: center;
      }

      .state-card--warning {
        min-height: auto;
        text-align: start;
        justify-items: start;
        border-style: dashed;
      }

      .state-card--error {
        border-color: color-mix(in srgb, #d15454 38%, var(--admin-border));
      }

      .loading-surface__grid,
      .skeleton-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .loading-surface__grid span,
      .skeleton-grid span {
        display: block;
        min-height: 5rem;
        border-radius: 1.2rem;
        background:
          linear-gradient(
            90deg,
            color-mix(in srgb, var(--admin-panel-soft) 96%, transparent) 0%,
            color-mix(in srgb, var(--admin-primary) 10%, var(--admin-panel-soft)) 50%,
            color-mix(in srgb, var(--admin-panel-soft) 96%, transparent) 100%
          );
        background-size: 200% 100%;
        animation: shimmer 1.4s linear infinite;
      }

      @keyframes shimmer {
        from {
          background-position: 200% 0;
        }
        to {
          background-position: -200% 0;
        }
      }

      @media (prefers-reduced-motion: no-preference) {
        .surface,
        .state-card {
          animation: surface-rise 420ms ease both;
        }

        .metric-card,
        .action-card,
        .message-card,
        .hero-stat {
          animation: card-rise 520ms ease both;
          animation-delay: calc(var(--item-index, 0) * 70ms);
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

      @media (max-width: 1220px) {
        .hero,
        .content-grid,
        .metrics-grid {
          grid-template-columns: 1fr 1fr;
        }

        .hero {
          min-height: auto;
        }

        .content-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 900px) {
        .hero,
        .metrics-grid,
        .hero__stats,
        .hero-panel__facts,
        .message-card__meta,
        .loading-surface__grid,
        .skeleton-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 720px) {
        .hero__header,
        .hero-panel__eyebrow,
        .hero-panel__footer,
        .message-card__header {
          flex-direction: column;
          align-items: flex-start;
        }

        .hero__signals span,
        .story-badge,
        .hero-panel__live,
        .status-pill,
        .button {
          width: 100%;
        }
      }

      @media (max-width: 640px) {
        .surface,
        .state-card {
          border-radius: 1.5rem;
          padding: 1.1rem;
        }

        .hero-panel,
        .metric-card,
        .action-card,
        .message-card,
        .hero-stat,
        .hero-panel__facts div,
        .loading-surface__grid span,
        .skeleton-grid span {
          border-radius: 1.2rem;
        }

        h1 {
          max-width: none;
        }
      }
    `,
  ],
})
export class AdminDashboardPageComponent {
  private readonly theme = inject(PublicThemeService);
  private readonly dashboardFacade = inject(AdminDashboardFacade);

  readonly copy = computed(() => getPortfolioCopy(this.theme.language(), 'adminDashboardPage'));
  private readonly refreshVersion = signal(0);

  readonly pageState = toSignal(
    toObservable(
      computed(() => ({
        refreshVersion: this.refreshVersion(),
        language: this.theme.language(),
      })),
    ).pipe(
      switchMap(() =>
        this.dashboardFacade.getOverview().pipe(
          map(data => ({ kind: 'success', data }) satisfies DashboardPageEvent),
          startWith({ kind: 'loading' } satisfies DashboardPageEvent),
          catchError(() => of({ kind: 'error' } satisfies DashboardPageEvent)),
        ),
      ),
      scan((state: DashboardPageState, event: DashboardPageEvent) => {
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

  readonly unreadCount = computed(() => {
    const metric = this.pageState()
      .data?.metrics.find(item => item.type === DASHBOARD_METRIC.unreadMessages);

    return metric?.value ?? 0;
  });

  readonly heroStats = computed<DashboardHeroStat[]>(() => {
    const data = this.pageState().data;

    return [
      {
        value: this.formatCount(data?.metrics.length ?? 0),
        label: this.copy().heroMetricsLabel,
      },
      {
        value: this.formatCount(data?.quickActions.length ?? 0),
        label: this.copy().heroActionsLabel,
      },
      {
        value: this.formatCount(data?.recentMessages.length ?? 0),
        label: this.copy().heroMessagesLabel,
      },
    ];
  });

  retry(): void {
    this.refreshVersion.update(value => value + 1);
  }

  metricContext(metric: AdminDashboardMetric): string {
    switch (metric.type) {
      case DASHBOARD_METRIC.totalProjects:
        return this.copy().metricProjectsContext;
      case DASHBOARD_METRIC.totalSkills:
        return this.copy().metricSkillsContext;
      case DASHBOARD_METRIC.totalContactMessages:
        return this.copy().metricMessagesContext;
      case DASHBOARD_METRIC.unreadMessages:
        return this.copy().metricUnreadContext;
      default:
        return this.copy().metricFallbackContext;
    }
  }

  metricIcon(metric: AdminDashboardMetric): string {
    switch (metric.type) {
      case DASHBOARD_METRIC.totalProjects:
        return '◫';
      case DASHBOARD_METRIC.totalSkills:
        return '✦';
      case DASHBOARD_METRIC.totalContactMessages:
        return '✉';
      case DASHBOARD_METRIC.unreadMessages:
        return '•';
      default:
        return '•';
    }
  }

  quickActionIcon(action: AdminDashboardQuickAction): string {
    switch (action.path) {
      case '/admin/projects':
        return '▣';
      case '/admin/skills':
        return '✦';
      case '/admin/experience':
        return '△';
      case '/admin/messages':
        return '✉';
      default:
        return '→';
    }
  }

  quickActionDescription(action: AdminDashboardQuickAction): string {
    switch (action.path) {
      case '/admin/projects':
        return this.copy().quickActionProjects;
      case '/admin/skills':
        return this.copy().quickActionSkills;
      case '/admin/experience':
        return this.copy().quickActionExperience;
      case '/admin/messages':
        return this.copy().quickActionMessages;
      default:
        return this.copy().quickActionFallback;
    }
  }

  formatDateTime(value: string): string {
    return new Intl.DateTimeFormat(this.locale(), {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  formatCount(value: number): string {
    return new Intl.NumberFormat(this.locale()).format(value);
  }

  private locale(): string {
    return this.theme.language() === 'ar' ? 'ar-EG' : 'en-US';
  }
}
