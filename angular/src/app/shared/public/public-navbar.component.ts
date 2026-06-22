import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthSessionService } from '@core/auth/auth-session.service';
import { AppShellService } from '@core/services/app-shell.service';
import { PublicThemeService } from '@core/services/public-theme.service';
import { trackByRoute } from '@core/utils/track-by.util';
import { PortfolioHomePageApiService } from '@features/portfolio/services/portfolio-home-page-api.service';
import { catchError, of } from 'rxjs';

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

      <button type="button" class="navbar__theme" (click)="theme.toggleTheme()" [attr.aria-label]="themeLabel()">
        {{ theme.theme() === 'dark' ? 'Light' : 'Dark' }}
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
        border-bottom: 1px solid var(--portfolio-border);
        background: color-mix(in srgb, var(--portfolio-bg-elevated) 88%, transparent);
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
        background: linear-gradient(135deg, var(--portfolio-primary) 0%, var(--portfolio-accent) 100%);
        color: var(--portfolio-primary-contrast);
        font-weight: 700;
      }

      strong,
      a {
        color: var(--portfolio-text);
      }

      small {
        display: block;
        color: var(--portfolio-muted);
      }

      .navbar__nav {
        display: flex;
        gap: 1.25rem;
        flex-wrap: wrap;
      }

      .navbar__nav a {
        text-decoration: none;
        font-weight: 600;
        color: var(--portfolio-muted);
      }

      .navbar__nav a.is-active {
        color: var(--portfolio-primary);
      }

      .navbar__action,
      .navbar__theme {
        border-radius: 999px;
        padding: 0.8rem 1.1rem;
        font-weight: 700;
      }

      .navbar__action {
        border: 0;
        background: var(--portfolio-primary);
        color: var(--portfolio-primary-contrast);
      }

      .navbar__theme {
        border: 1px solid var(--portfolio-border);
        background: transparent;
        color: var(--portfolio-text);
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

        .navbar__action,
        .navbar__theme {
          width: 100%;
        }
      }
    `,
  ],
})
export class PublicNavbarComponent {
  readonly shell = inject(AppShellService);
  readonly session = inject(AuthSessionService);
  readonly theme = inject(PublicThemeService);
  readonly trackByRoute = trackByRoute;
  private readonly identity = toSignal(inject(PortfolioHomePageApiService).getIdentity().pipe(catchError(() => of(null))), {
    initialValue: null,
  });

  readonly brandName = computed(() => this.identity()?.fullName ?? 'Kareem Zarif');
  readonly headline = computed(() => this.identity()?.professionalTitle ?? 'Business-Oriented .NET Full Stack Developer');
  readonly themeLabel = computed(() =>
    this.theme.theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
  );

  login(): void {
    if (this.session.isAuthenticated) {
      this.session.openAdmin();
      return;
    }

    this.session.login();
  }
}
