import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PORTFOLIO_APP_NAME } from '@core/tokens/portfolio-app-name.token';
import { AppShellService } from '@core/services/app-shell.service';
import { trackByRoute } from '@core/utils/track-by.util';

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
          <strong>{{ appName }}</strong>
          <small>Admin workspace</small>
        </div>
      </div>

      <nav class="sidebar__nav">
        @for (item of shell.adminNavigation; track trackByRoute($index, item)) {
          <a [routerLink]="item.route" routerLinkActive="is-active">
            <i [class]="item.icon"></i>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>
    </aside>
  `,
  styles: [
    `
      .sidebar {
        display: grid;
        gap: 1.4rem;
        padding: 1.5rem 1rem;
        border-right: 1px solid #d7e0ea;
        background: linear-gradient(180deg, #0f2335 0%, #18344c 100%);
        color: #eaf3fb;
      }

      .sidebar__brand {
        display: flex;
        gap: 0.8rem;
        align-items: center;
      }

      .sidebar__mark {
        width: 2.5rem;
        height: 2.5rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.85rem;
        background: rgba(255, 255, 255, 0.14);
        font-weight: 700;
      }

      .sidebar__brand small {
        display: block;
        color: rgba(234, 243, 251, 0.68);
      }

      .sidebar__nav {
        display: grid;
        gap: 0.45rem;
      }

      .sidebar__nav a {
        display: flex;
        gap: 0.8rem;
        align-items: center;
        padding: 0.85rem 0.95rem;
        border-radius: 0.95rem;
        color: inherit;
        text-decoration: none;
      }

      .sidebar__nav a.is-active,
      .sidebar__nav a:hover {
        background: rgba(255, 255, 255, 0.12);
      }
    `,
  ],
})
export class AdminSidebarComponent {
  readonly appName = inject(PORTFOLIO_APP_NAME);
  readonly shell = inject(AppShellService);
  readonly trackByRoute = trackByRoute;
}
