import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AuthSessionService } from '@core/auth/auth-session.service';
import { AppShellService } from '@core/services/app-shell.service';
import { PublicThemeService } from '@core/services/public-theme.service';
import { trackByRoute } from '@core/utils/track-by.util';
import { PortfolioHomePageApiService } from '@features/portfolio/services/portfolio-home-page-api.service';
import { catchError, of, switchMap } from 'rxjs';

const NAVBAR_COPY = {
  en: {
    navigationLabel: 'Primary navigation',
    languageToggle: 'العربية',
    menu: 'Menu',
    close: 'Close',
    adminLogin: 'Admin login',
    adminDashboard: 'Dashboard',
    defaultHeadline: 'Business-oriented .NET and Angular full-stack developer',
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode',
  },
  ar: {
    navigationLabel: 'التنقل الرئيسي',
    languageToggle: 'English',
    menu: 'القائمة',
    close: 'إغلاق',
    adminLogin: 'تسجيل دخول الإدارة',
    adminDashboard: 'لوحة التحكم',
    defaultHeadline: 'مطوّر ويب متكامل باستخدام .NET و Angular مع تركيز على الأعمال',
    switchToLight: 'التبديل إلى الوضع الفاتح',
    switchToDark: 'التبديل إلى الوضع الداكن',
  },
} as const;

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="navbar">
      <div class="navbar__inner">
        <a class="navbar__brand" routerLink="/" (click)="closeMenu()">
          <span class="navbar__brand-mark">KZ</span>
          <span class="navbar__brand-copy">
            <strong>{{ brandName() }}</strong>
            <small>{{ headline() }}</small>
          </span>
        </a>

        <button
          type="button"
          class="navbar__menu"
          [attr.aria-expanded]="menuOpen()"
          [attr.aria-label]="menuLabel()"
          (click)="toggleMenu()"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div class="navbar__panel" [class.is-open]="menuOpen()">
          <nav class="navbar__nav" [attr.aria-label]="copy().navigationLabel">
            @for (item of navigationItems(); track trackByRoute($index, item)) {
              <a
                [routerLink]="item.path"
                routerLinkActive="is-active"
                [routerLinkActiveOptions]="{ exact: item.exactMatch }"
                (click)="closeMenu()"
              >
                <i [class]="item.icon"></i>
                <span>{{ item.label }}</span>
              </a>
            }
          </nav>

          <div class="navbar__actions">
            <button type="button" class="navbar__toggle" (click)="theme.toggleLanguage()">
              {{ copy().languageToggle }}
            </button>

            <button
              type="button"
              class="navbar__toggle"
              (click)="theme.toggleTheme()"
              [attr.aria-label]="themeLabel()"
            >
              {{ theme.isDark() ? 'Light' : 'Dark' }}
            </button>

            <button type="button" class="navbar__cta" (click)="openAdmin()">
              {{ adminLabel() }}
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      .navbar {
        position: sticky;
        top: 0;
        z-index: 20;
        padding: clamp(0.9rem, 3vw, 1.35rem) clamp(1rem, 4vw, 2.75rem);
        background: linear-gradient(
          180deg,
          color-mix(in srgb, var(--portfolio-bg) 84%, transparent),
          color-mix(in srgb, var(--portfolio-bg) 38%, transparent)
        );
        backdrop-filter: blur(18px);
      }

      .navbar__inner {
        width: min(100%, 1440px);
        margin-inline: auto;
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: center;
        gap: 1rem clamp(1rem, 2vw, 1.5rem);
        padding: 1rem clamp(1rem, 2vw, 1.4rem);
        border: 1px solid var(--portfolio-border);
        border-radius: 1.6rem;
        background: color-mix(in srgb, var(--portfolio-bg-elevated) 92%, transparent);
        box-shadow: var(--portfolio-shadow);
      }

      .navbar__brand {
        display: flex;
        gap: 0.85rem;
        align-items: center;
        text-decoration: none;
        min-width: 0;
      }

      .navbar__brand-mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 3rem;
        height: 3rem;
        border-radius: 1rem;
        background: linear-gradient(135deg, var(--portfolio-primary) 0%, var(--portfolio-accent) 100%);
        color: var(--portfolio-primary-contrast);
        font-weight: 800;
        letter-spacing: 0.08em;
        box-shadow: 0 18px 35px -24px color-mix(in srgb, var(--portfolio-primary) 80%, transparent);
      }

      .navbar__brand-copy {
        min-width: 0;
        display: grid;
      }

      .navbar__brand strong {
        color: var(--portfolio-text);
        font-size: 1rem;
      }

      .navbar__brand small {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--portfolio-muted);
        font-size: 0.85rem;
      }

      .navbar__menu {
        display: none;
        justify-self: end;
        width: 3rem;
        height: 3rem;
        border: 1px solid var(--portfolio-border);
        border-radius: 999px;
        background: transparent;
        color: var(--portfolio-text);
        padding: 0.75rem;
      }

      .navbar__menu span {
        display: block;
        height: 2px;
        margin: 0.22rem 0;
        border-radius: 999px;
        background: currentColor;
      }

      .navbar__panel {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        min-width: 0;
      }

      .navbar__nav {
        display: flex;
        gap: 0.65rem;
        flex-wrap: wrap;
        align-items: center;
        min-width: 0;
      }

      .navbar__nav a {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
        min-height: 2.9rem;
        padding: 0.78rem 1rem;
        border-radius: 999px;
        text-decoration: none;
        font-weight: 600;
        color: var(--portfolio-muted);
        transition:
          transform 180ms ease,
          color 180ms ease,
          background 180ms ease;
      }

      .navbar__nav a:hover,
      .navbar__nav a.is-active {
        transform: translateY(-1px);
        background: color-mix(in srgb, var(--portfolio-primary) 9%, transparent);
        color: var(--portfolio-primary);
      }

      .navbar__actions {
        display: flex;
        justify-content: end;
        align-items: center;
        gap: 0.65rem;
        flex-wrap: wrap;
      }

      .navbar__toggle,
      .navbar__cta {
        border-radius: 999px;
        min-height: 2.9rem;
        padding: 0.78rem 1rem;
        font-weight: 700;
        transition:
          transform 180ms ease,
          border-color 180ms ease,
          background 180ms ease;
      }

      .navbar__toggle:hover,
      .navbar__cta:hover {
        transform: translateY(-1px);
      }

      .navbar__toggle {
        border: 1px solid var(--portfolio-border);
        background: transparent;
        color: var(--portfolio-text);
      }

      .navbar__cta {
        border: 1px solid transparent;
        background: linear-gradient(135deg, var(--portfolio-primary), color-mix(in srgb, var(--portfolio-primary) 68%, var(--portfolio-accent)));
        color: var(--portfolio-primary-contrast);
      }

      @media (prefers-reduced-motion: no-preference) {
        .navbar__inner {
          animation: navbar-rise 380ms ease both;
        }

        @keyframes navbar-rise {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      }

      @media (max-width: 1024px) {
        .navbar__inner {
          grid-template-columns: auto auto;
        }

        .navbar__menu {
          display: inline-flex;
          flex-direction: column;
          justify-content: center;
        }

        .navbar__panel {
          grid-column: 1 / -1;
          display: none;
          width: 100%;
          padding-block-start: 0.5rem;
          border-top: 1px solid var(--portfolio-border);
        }

        .navbar__panel.is-open {
          display: grid;
          gap: 1rem;
        }

        .navbar__nav,
        .navbar__actions {
          width: 100%;
        }

        .navbar__nav {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .navbar__nav a,
        .navbar__toggle,
        .navbar__cta {
          justify-content: center;
        }
      }

      @media (max-width: 640px) {
        .navbar__brand small {
          white-space: normal;
        }

        .navbar__nav {
          grid-template-columns: 1fr;
        }

        .navbar__actions {
          display: grid;
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
  readonly menuOpen = signal(false);

  readonly copy = computed(() => NAVBAR_COPY[this.theme.language()]);
  private readonly publicShell = toSignal(this.shell.publicShell$.pipe(catchError(() => of(null))), { initialValue: null });
  private readonly navigation = toSignal(this.shell.publicNavigation$.pipe(catchError(() => of([]))), { initialValue: [] });
  private readonly identity = toSignal(
    toSignalLanguageStream(this.theme.language, inject(PortfolioHomePageApiService)),
    { initialValue: null },
  );

  readonly brandName = computed(() => this.publicShell()?.brandName ?? this.identity()?.fullName ?? 'Kareem Zarif');
  readonly headline = computed(() => this.identity()?.professionalTitle ?? this.copy().defaultHeadline);
  readonly navigationItems = computed(() => this.navigation());
  readonly adminLabel = computed(() =>
    this.session.isAuthenticated ? this.copy().adminDashboard : this.copy().adminLogin,
  );
  readonly menuLabel = computed(() => (this.menuOpen() ? this.copy().close : this.copy().menu));
  readonly themeLabel = computed(() =>
    this.theme.theme() === 'dark' ? this.copy().switchToLight : this.copy().switchToDark,
  );

  toggleMenu(): void {
    this.menuOpen.update(value => !value);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  openAdmin(): void {
    this.closeMenu();

    if (this.session.isAuthenticated) {
      this.session.openAdmin();
      return;
    }

    this.session.openAdminLogin();
  }
}

function toSignalLanguageStream(
  language: PublicThemeService['language'],
  identityService: PortfolioHomePageApiService,
) {
  return toObservable(language).pipe(switchMap(() => identityService.getIdentity().pipe(catchError(() => of(null)))));
}
