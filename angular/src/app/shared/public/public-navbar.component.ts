import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AuthSessionService } from '@core/auth/auth-session.service';
import { AppShellService } from '@core/services/app-shell.service';
import { getPortfolioCopy } from '@localization/index';
import { PublicThemeService } from '@core/services/public-theme.service';
import { trackByRoute } from '@core/utils/track-by.util';
import { PortfolioHomePageApiService } from '@features/portfolio/services/portfolio-home-page-api.service';
import { catchError, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div></div>`,
  styles: [],
})
export class PublicNavbarComponent {
  readonly shell = inject(AppShellService);
  readonly session = inject(AuthSessionService);
  readonly theme = inject(PublicThemeService);
  readonly trackByRoute = trackByRoute;
  readonly menuOpen = signal(false);

  readonly copy = computed(() => getPortfolioCopy(this.theme.language(), 'publicNavbar'));
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
