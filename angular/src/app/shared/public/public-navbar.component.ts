import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthSessionService } from '@core/auth/auth-session.service';
import { AppShellService } from '@core/services/app-shell.service';
import { PublicThemeService } from '@core/services/public-theme.service';
import { getPortfolioCopy } from '@localization/index';
import { trackByRoute } from '@core/utils/track-by.util';
import { PortfolioHomePageApiService } from '@features/portfolio/services/portfolio-home-page-api.service';
import { catchError, of, switchMap } from 'rxjs';
import { NavBrandComponent } from '@shared/molecules/nav-brand.component';
@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NavBrandComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- ── Sticky nav ──────────────────────────────────────────────────────── -->
    <header class="kz-nav" role="banner">
      <div class="nav-inner">

        <!-- Brand -->
        <app-nav-brand
          [fullName]="brandName()"
          [firstName]="firstName()"
          [lastName]="lastName()"
        />

        <!-- Desktop links -->
        <nav class="nav-links" [attr.aria-label]="copy().navigationLabel">
          @for (item of navigationItems(); track trackByRoute($index, item)) {
            <a
              [routerLink]="item.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.path === '/' }"
            >{{ item.label }}</a>
          }
        </nav>

        <!-- Right controls -->
        <div class="nav-right">

          <!-- Language toggle -->
          <button
            type="button"
            class="kz-icon-btn lang-btn"
            [attr.aria-label]="copy().languageToggle"
            (click)="theme.toggleLanguage()"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span class="lang-label">{{ langToggleLabel() }}</span>
          </button>

          <!-- Theme toggle -->
          <button
            type="button"
            class="kz-icon-btn"
            [attr.aria-label]="themeLabel()"
            (click)="theme.toggleTheme()"
          >
            @if (theme.isDark()) {
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            } @else {
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            }
          </button>

          <!-- CTA (desktop) -->
          <a
            [routerLink]="'/contact'"
            class="kz-btn kz-btn--primary nav-cta"
          >{{ copy().contactMe }}</a>

          <!-- Mobile menu toggle -->
          <button
            type="button"
            class="kz-icon-btn menu-btn"
            [attr.aria-label]="copy().menu"
            (click)="openMenu()"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6"  x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- ── Mobile sheet overlay ────────────────────────────────────────────── -->
    <div
      class="sheet"
      [class.sheet--open]="menuOpen()"
      role="dialog"
      [attr.aria-label]="copy().menu"
      [attr.aria-modal]="menuOpen()"
      (click)="onSheetBackdrop($event)"
    >
      <div class="sheet-panel">
        <div class="sheet-head">
          <app-nav-brand
            [fullName]="brandName()"
            [firstName]="firstName()"
            [lastName]="lastName()"
          />
          <button
            type="button"
            class="kz-icon-btn"
            [attr.aria-label]="copy().close"
            (click)="closeMenu()"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <nav class="sheet-links">
          @for (item of navigationItems(); track trackByRoute($index, item)) {
            <a [routerLink]="item.path" (click)="closeMenu()">{{ item.label }}</a>
          }
        </nav>

        <div class="sheet-actions">
          <a [routerLink]="'/contact'" class="kz-btn kz-btn--primary" (click)="closeMenu()">
            {{ copy().contactMe }}
          </a>
          <button type="button" class="sheet-theme-row" (click)="theme.toggleTheme()">
            <span>{{ themeLabel() }}</span>
            <span class="theme-indicator" [class.dark]="theme.isDark()"></span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── Nav shell ─────────────────────────────────────────────────────────── */
    .kz-nav {
      position: sticky;
      display: block;
      top: 0;
      z-index: 50;
      height: 70px;
      background: var(--nav-bg, rgba(20,20,20,.74));
      backdrop-filter: saturate(140%) blur(14px);
      -webkit-backdrop-filter: saturate(140%) blur(14px);
      border-bottom: 1px solid var(--nav-border, #2a2a2a);
      box-shadow: var(--nav-shadow, none);
      transition:
        background var(--dur, 240ms) var(--ease),
        border-color var(--dur, 240ms) var(--ease),
        box-shadow var(--dur, 240ms) var(--ease);
    }

    .nav-inner {
      max-width: var(--rail, 1180px);
      height: 100%;
      margin: 0 auto;
      padding: 0 28px;
      display: flex;
      align-items: center;
      gap: 22px;
    }

    /* ── Desktop nav links ─────────────────────────────────────────────────── */
    .nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-inline-start: 14px;
    }

    .nav-links a {
      padding: 8px 12px;
      border-radius: var(--r-sm, 6px);
      font-size: 14px;
      font-weight: 500;
      color: var(--text-muted, #4b5563);
      transition:
        color var(--dur-fast, 150ms) var(--ease),
        background var(--dur-fast, 150ms) var(--ease);
      text-decoration: none;
    }

    .nav-links a:hover { color: var(--text); background: var(--border-soft); }

    .nav-links a.active {
      color: var(--text);
      position: relative;
    }

    .nav-links a.active::after {
      content: "";
      display: block;
      height: 2px;
      width: 18px;
      margin: 4px auto 0;
      background: var(--accent-line, #a8d234);
      border-radius: var(--r-full, 9999px);
    }

    /* ── Right controls ─────────────────────────────────────────────────────── */
    .nav-right {
      margin-inline-start: auto;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* Override Tailwind preflight / browser defaults for buttons in nav */
    .nav-right button {
      font-family: inherit;
    }

    /* Language toggle wide style */
    .lang-btn {
      width: auto;
      padding: 0 14px;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: var(--text, #111827);
    }

    .lang-label {
      font-size: 13px;
      font-weight: 600;
    }

    /* kz-icon-btn styles (local, since we're not using the atom) */
    .kz-icon-btn {
      width: 40px;
      height: 40px;
      border-radius: var(--r-sm, 6px);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--surface, #ffffff);
      border: 1px solid var(--border, #e5e7eb);
      color: var(--text, #111827);
      cursor: pointer;
      transition:
        border-color var(--dur-fast, 150ms) var(--ease),
        transform var(--dur-fast, 150ms) var(--ease),
        background var(--dur-fast, 150ms) var(--ease),
        color var(--dur-fast, 150ms) var(--ease);
    }
    .kz-icon-btn:hover  { border-color: var(--accent-line, #a8d234); }
    .kz-icon-btn:active { transform: scale(.96); }

    /* CTA button */
    .nav-cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 40px;
      padding: 0 18px;
      border-radius: var(--r, 8px);
      font-size: 14px;
      font-weight: 600;
      white-space: nowrap;
      background: var(--gradient-brand, linear-gradient(94deg, #85bb23 0%, #6ea30d 100%));
      color: #fff !important;
      border: 1px solid rgba(255, 255, 255, .12);
      box-shadow: var(--shadow-btn);
      text-decoration: none;
      cursor: pointer;
      transition:
        filter var(--dur-fast, 150ms) var(--ease),
        transform var(--dur-fast, 150ms) var(--ease);
    }
    .nav-cta:hover {
      filter: brightness(1.07);
      transform: translateY(-1px);
      color: #fff !important;
    }
    .nav-cta:active { transform: scale(.98); }

    .menu-btn { display: none; }

    /* ── Mobile sheet ─────────────────────────────────────────────────────── */
    .sheet {
      position: fixed;
      inset: 0;
      z-index: 60;
      display: none;
      background: rgba(0, 0, 0, .5);
      backdrop-filter: blur(4px);
    }

    .sheet--open { display: block; }

    .sheet-panel {
      position: absolute;
      top: 0;
      inset-inline-end: 0;
      height: 100%;
      width: min(82vw, 320px);
      background: var(--surface, #ffffff);
      border-inline-start: 1px solid var(--border, #e5e7eb);
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      box-shadow: var(--shadow-xl);
      animation: kz-slide-in .28s var(--ease, cubic-bezier(.2,.7,.3,1));
    }

    :host-context([dir="rtl"]) .sheet-panel {
      animation: kz-slide-in-rtl .28s var(--ease, cubic-bezier(.2,.7,.3,1));
    }

    .sheet-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .sheet-links {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .sheet-links a {
      padding: 13px 12px;
      border-radius: var(--r, 8px);
      font-size: 16px;
      font-weight: 600;
      color: var(--text, #111827);
      text-decoration: none;
      transition: background var(--dur-fast, 150ms) var(--ease);
    }

    .sheet-links a:hover { background: var(--border-soft); }

    .sheet-actions {
      margin-top: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .sheet-actions a.kz-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 44px;
      padding: 0 18px;
      border-radius: var(--r, 8px);
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      background: var(--gradient-brand, linear-gradient(94deg, #85bb23 0%, #6ea30d 100%));
      color: #fff !important;
      border: 1px solid rgba(255,255,255,.12);
      box-shadow: var(--shadow-btn);
    }

    .sheet-theme-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 12px;
      border-radius: var(--r, 8px);
      border: 1px solid var(--border, #e5e7eb);
      background: transparent;
      color: var(--text-muted, #4b5563);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
    }

    .theme-indicator {
      width: 32px;
      height: 18px;
      border-radius: 9px;
      background: var(--border, #e5e7eb);
      position: relative;
      transition: background var(--dur-fast, 150ms) var(--ease);
    }

    .theme-indicator::after {
      content: "";
      position: absolute;
      top: 3px;
      inset-inline-start: 3px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--text-muted, #4b5563);
      transition: transform var(--dur-fast, 150ms) var(--ease);
    }

    .theme-indicator.dark::after {
      transform: translateX(14px);
      background: var(--lime-bright, #b2e742);
    }

    /* ── Responsive ──────────────────────────────────────────────────────── */
    @media (max-width: 760px) {
      .nav-links { display: none; }
      .nav-cta   { display: none; }
      .menu-btn  { display: inline-flex; }
      .nav-inner { padding: 0 18px; gap: 12px; }
    }
  `],
})
export class PublicNavbarComponent {
  readonly shell = inject(AppShellService);
  readonly session = inject(AuthSessionService);
  readonly theme = inject(PublicThemeService);
  private readonly homeApi = inject(PortfolioHomePageApiService);
  readonly trackByRoute = trackByRoute;
  readonly menuOpen = signal(false);

  readonly copy = computed(() => getPortfolioCopy(this.theme.language(), 'publicNavbar'));

  private readonly _identity = toSignal(
    toObservable(this.theme.language).pipe(
      switchMap(() => this.homeApi.getIdentity().pipe(catchError(() => of(null)))),
    ),
    { initialValue: null },
  );

  private readonly _navigation = toSignal(
    this.shell.publicNavigation$.pipe(catchError(() => of([]))),
    { initialValue: [] },
  );

  readonly brandName   = computed(() => this._identity()?.fullName ?? 'Kareem Zarif');
  readonly firstName   = computed(() => this.brandName().split(' ')[0]);
  readonly lastName    = computed(() => this.brandName().split(' ').slice(1).join(' '));

  readonly navigationItems = computed(() => {
    const api = this._navigation();
    if (api.length > 0) return api;
    const c = this.copy();
    return [
      { label: c.navHome,       path: '/',           exactMatch: true  },
      { label: c.navProjects,   path: '/projects',   exactMatch: false },
      { label: c.navExperience, path: '/experience', exactMatch: false },
      { label: c.navSkills,     path: '/skills',     exactMatch: false },
      { label: c.navContact,    path: '/contact',    exactMatch: false },
    ];
  });

  readonly langToggleLabel = computed(() =>
    this.theme.language() === 'en' ? 'العربية' : 'English',
  );

  readonly themeLabel = computed(() =>
    this.theme.isDark() ? this.copy().switchToLight : this.copy().switchToDark,
  );

  openMenu():  void { this.menuOpen.set(true); }
  closeMenu(): void { this.menuOpen.set(false); }

  onSheetBackdrop(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('sheet')) {
      this.closeMenu();
    }
  }
}
