import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppShellService } from '@core/services/app-shell.service';
import { PublicThemeService } from '@core/services/public-theme.service';
import { trackByRoute } from '@core/utils/track-by.util';
import { catchError, of } from 'rxjs';

const SIDEBAR_COPY = {
  en: {
    caption: 'Admin workspace',
    helper: 'Protected operations for projects, skills, experience, and messages.',
  },
  ar: {
    caption: 'مساحة الإدارة',
    helper: 'عمليات محمية لإدارة المشاريع والمهارات والخبرات ورسائل التواصل.',
  },
} as const;

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="sidebar">
      <div class="sidebar__brand">
        <span class="sidebar__mark">KZ</span>
        <div>
          <strong>{{ brandName() }}</strong>
          <small>{{ copy().caption }}</small>
        </div>
      </div>

      <nav class="sidebar__nav">
        @for (item of navigationItems(); track trackByRoute($index, item)) {
          <a
            [routerLink]="item.path"
            routerLinkActive="is-active"
            [routerLinkActiveOptions]="{ exact: item.exactMatch }"
          >
            <i [class]="item.icon"></i>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <p class="sidebar__helper">{{ copy().helper }}</p>
    </aside>
  `,
  styles: [
    `
      .sidebar {
        display: grid;
        gap: 1.4rem;
        align-content: start;
        padding: 1.4rem;
        border: 1px solid var(--admin-border);
        border-radius: 1.65rem;
        background: linear-gradient(
          180deg,
          color-mix(in srgb, var(--admin-panel-soft) 92%, transparent),
          color-mix(in srgb, var(--admin-panel) 90%, transparent)
        );
        color: var(--admin-text);
        box-shadow: var(--admin-shadow);
        backdrop-filter: blur(16px);
      }

      .sidebar__brand {
        display: flex;
        gap: 0.8rem;
        align-items: center;
      }

      .sidebar__mark {
        width: 2.85rem;
        height: 2.85rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 1rem;
        background: linear-gradient(135deg, var(--admin-primary), var(--admin-accent));
        color: var(--admin-primary-contrast);
        font-weight: 800;
        letter-spacing: 0.08em;
      }

      .sidebar__brand small {
        display: block;
        color: var(--admin-muted);
      }

      .sidebar__nav {
        display: grid;
        gap: 0.55rem;
      }

      .sidebar__nav a {
        display: flex;
        gap: 0.8rem;
        align-items: center;
        min-height: 3rem;
        padding: 0.9rem 1rem;
        border-radius: 1rem;
        color: inherit;
        text-decoration: none;
        transition:
          transform 180ms ease,
          background 180ms ease,
          color 180ms ease;
      }

      .sidebar__nav a.is-active,
      .sidebar__nav a:hover {
        transform: translateX(2px);
        background: color-mix(in srgb, var(--admin-primary) 12%, transparent);
        color: var(--admin-primary);
      }

      .sidebar__helper {
        margin: 0;
        color: var(--admin-muted);
        line-height: 1.7;
      }

      @media (max-width: 960px) {
        .sidebar__nav {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 640px) {
        .sidebar__nav {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AdminSidebarComponent {
  readonly shell = inject(AppShellService);
  readonly theme = inject(PublicThemeService);
  readonly trackByRoute = trackByRoute;
  readonly copy = computed(() => SIDEBAR_COPY[this.theme.language()]);
  private readonly adminShell = toSignal(this.shell.adminShell$.pipe(catchError(() => of(null))), { initialValue: null });
  private readonly navigation = toSignal(this.shell.adminNavigation$.pipe(catchError(() => of([]))), { initialValue: [] });

  readonly brandName = computed(() => this.adminShell()?.brandName ?? 'Kareem Zarif');
  readonly navigationItems = computed(() => this.navigation());
}
