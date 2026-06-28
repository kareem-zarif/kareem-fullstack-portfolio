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
import { IconBtnComponent } from '@shared/atoms/icon-btn.component';
import { PortfolioBtnComponent } from '@shared/atoms/portfolio-btn.component';
@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NavBrandComponent,
    IconBtnComponent,
    PortfolioBtnComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- ── Sticky nav ──────────────────────────────────────────────────────── -->
    <header class="nav" role="banner">
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
          <app-icon-btn
            [ariaLabel]="copy().languageToggle"
            [wide]="true"
            (clicked)="theme.toggleLanguage()"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span>{{ langToggleLabel() }}</span>
          </app-icon-btn>

          <!-- Theme toggle -->
          <app-icon-btn
            [ariaLabel]="themeLabel()"
            (clicked)="theme.toggleTheme()"
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
          </app-icon-btn>

          <!-- CTA (desktop) -->
          <app-portfolio-btn
            class="nav-cta"
            variant="primary"
            routerPath="/contact"
          >
            {{ copy().contactMe }}
          </app-portfolio-btn>

          <!-- Mobile menu toggle -->
          <app-icon-btn
            class="menu-btn"
            [ariaLabel]="copy().menu"
            (clicked)="openMenu()"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6"  x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </app-icon-btn>
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
          <app-icon-btn [ariaLabel]="copy().close" (clicked)="closeMenu()">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </app-icon-btn>
        </div>

        <nav class="sheet-links">
          @for (item of navigationItems(); track trackByRoute($index, item)) {
            <a [routerLink]="item.path" (click)="closeMenu()">{{ item.label }}</a>
          }
        </nav>

        <div class="sheet-actions">
          <app-portfolio-btn variant="primary" routerPath="/contact" (click)="closeMenu()">
            {{ copy().contactMe }}
          </app-portfolio-btn>
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
    .nav {
      position: sticky;
      top: 0;
      z-index: 50;
      height: 70px;
      background: var(--nav-bg, rgba(20,20,20,.74));
      backdrop-filter: saturate(140%) blur(14px);
      -webkit-backdrop-filter: saturate(140%) blur(14px);
      border-bottom: 1px solid var(--nav-border, #2a2a2a);
      transition:
        background var(--dur, 240ms) var(--ease),
        border-color var(--dur, 240ms) var(--ease);
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
      color: var(--text-muted, #c7c9c2);
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
      background: var(--accent-line, #b2e742);
      border-radius: var(--r-full, 9999px);
    }

    /* ── Right controls ─────────────────────────────────────────────────────── */
    .nav-right {
      margin-inline-start: auto;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .nav-cta { display: block; }

    .menu-btn { display: none !important; }

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
      background: var(--surface, #1e1e1e);
      border-inline-start: 1px solid var(--border, #2e2e2e);
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
      color: var(--text, #f4f5f0);
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

    .sheet-theme-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 12px;
      border-radius: var(--r, 8px);
      border: 1px solid var(--border, #2e2e2e);
      background: transparent;
      color: var(--text-muted, #c7c9c2);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }

    .theme-indicator {
      width: 32px;
      height: 18px;
      border-radius: 9px;
      background: var(--border, #2e2e2e);
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
      background: var(--text-muted, #c7c9c2);
      transition: transform var(--dur-fast, 150ms) var(--ease);
    }

    .theme-indicator.dark::after {
      transform: translateX(14px);
      background: var(--lime-bright, #b2e742);
    }

    /* ── Responsive ──────────────────────────────────────────────────────── */
    @media (max-width: 760px) {
      .nav-links { display: none !important; }
      .nav-cta   { display: none !important; }
      .menu-btn  { display: inline-flex !important; }
      .nav-inner { padding: 0 18px; gap: 12px; }
    }
  `],
})
export class PublicNavbarComponent {
  readonly shell = inject(AppShellService);
  readonly session = inject(AuthSessionService);
  readonly theme = inject(PublicThemeService);
  readonly trackByRoute = trackByRoute;
  readonly menuOpen = signal(false);

  readonly copy = computed(() => getPortfolioCopy(this.theme.language(), 'publicNavbar'));

  private readonly _identity = toSignal(
    toObservable(this.theme.language).pipe(
      switchMap(() => inject(PortfolioHomePageApiService).getIdentity().pipe(catchError(() => of(null)))),
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
  readonly navigationItems = computed(() => this._navigation());

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
