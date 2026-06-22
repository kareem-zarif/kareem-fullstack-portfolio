import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthSessionService } from '@core/auth/auth-session.service';
import { AppShellService } from '@core/services/app-shell.service';
import { trackByRoute } from '@core/utils/track-by.util';
import { SiteSettingsService } from '@features/portfolio/services/site-settings.service';
import { SiteSetting } from '@shared/models';

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="navbar">
      <a class="navbar__brand" routerLink="/">
        <span class="navbar__brand-mark">KZ</span>
        <span>
          <strong>{{ brandName() }}</strong>
          <small>{{ headline() }}</small>
        </span>
      </a>

      <nav class="navbar__nav">
        @for (item of shell.publicNavigation; track trackByRoute($index, item)) {
          <a
            [routerLink]="item.route"
            routerLinkActive="is-active"
            [routerLinkActiveOptions]="{ exact: item.route === '/' }"
          >
            {{ item.label }}
          </a>
        }
      </nav>

      <button type="button" class="navbar__action" (click)="login()">
        {{ session.isAuthenticated ? 'Admin Dashboard' : 'Admin Login' }}
      </button>
    </header>
  `,
  styles: [
    `
      .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: 1.2rem clamp(1rem, 4vw, 2.5rem);
        border-bottom: 1px solid rgba(14, 41, 64, 0.08);
        background: rgba(248, 251, 255, 0.85);
        backdrop-filter: blur(12px);
        position: sticky;
        top: 0;
        z-index: 5;
      }

      .navbar__brand {
        display: flex;
        gap: 0.85rem;
        align-items: center;
        text-decoration: none;
      }

      .navbar__brand-mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.6rem;
        height: 2.6rem;
        border-radius: 0.9rem;
        background: linear-gradient(135deg, #113556 0%, #2c7ba4 100%);
        color: white;
        font-weight: 700;
      }

      strong,
      a {
        color: #11263a;
      }

      small {
        display: block;
        color: #6d7d93;
      }

      .navbar__nav {
        display: flex;
        gap: 1.25rem;
        flex-wrap: wrap;
      }

      .navbar__nav a {
        text-decoration: none;
        font-weight: 600;
        color: #577089;
      }

      .navbar__nav a.is-active {
        color: #0f4065;
      }

      .navbar__action {
        border: 0;
        border-radius: 999px;
        padding: 0.8rem 1.1rem;
        background: #123b5c;
        color: #ffffff;
        font-weight: 600;
      }

      @media (max-width: 900px) {
        .navbar {
          align-items: start;
          flex-direction: column;
        }

        .navbar__nav {
          width: 100%;
        }
      }
    `,
  ],
})
export class PublicNavbarComponent {
  readonly shell = inject(AppShellService);
  readonly session = inject(AuthSessionService);
  readonly trackByRoute = trackByRoute;
  private readonly settings = toSignal(inject(SiteSettingsService).getSiteSettings(), {
    initialValue: [] as SiteSetting[],
  });

  readonly brandName = computed(
    () => this.settings().find(setting => setting.key === 'brandName')?.value ?? 'Portfolio',
  );
  readonly headline = computed(
    () => this.settings().find(setting => setting.key === 'headline')?.value ?? 'Full-Stack Engineer',
  );

  login(): void {
    if (this.session.isAuthenticated) {
      this.session.openAdmin();
      return;
    }

    this.session.login();
  }
}
