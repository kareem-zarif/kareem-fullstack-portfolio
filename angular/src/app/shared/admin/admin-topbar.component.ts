import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppShellService } from '@core/services/app-shell.service';
import { AuthSessionService } from '@core/auth/auth-session.service';
import { getPortfolioCopy } from '@localization/index';
import { PublicThemeService } from '@core/services/public-theme.service';
import { catchError, combineLatest, filter, map, of, startWith } from 'rxjs';

@Component({
  selector: 'app-admin-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="topbar">
      <div>
        <p>{{ copy().eyebrow }}</p>
        <h1>{{ currentSection() }}</h1>
      </div>
      <div class="topbar__actions">
        @if (session.currentUser; as user) {
          <div class="topbar__identity">
            <span>{{ copy().signedInAs }}</span>
            <strong>{{ user.userName }}</strong>
          </div>
        }
        <a routerLink="/">{{ copy().preview }}</a>
        <button type="button" (click)="theme.toggleLanguage()">{{ copy().switchLanguage }}</button>
        <button type="button" (click)="theme.toggleTheme()">{{ theme.isDark() ? copy().themeLight : copy().themeDark }}</button>
        <button type="button" (click)="logout()" [disabled]="isLoggingOut()">
          {{ isLoggingOut() ? copy().loggingOut : copy().logout }}
        </button>
      </div>
    </header>
  `,
  styles: [
    `
      .topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: 1.2rem 1.4rem;
        border: 1px solid var(--admin-border);
        border-radius: 1.55rem;
        background: color-mix(in srgb, var(--admin-panel) 92%, transparent);
        box-shadow: var(--admin-shadow);
        backdrop-filter: blur(16px);
        position: sticky;
        top: 0;
        z-index: 10;
      }

      p,
      h1 {
        margin: 0;
      }

      p {
        color: var(--admin-muted);
        text-transform: uppercase;
        font-size: 0.8rem;
        letter-spacing: 0.12em;
      }

      h1 {
        color: var(--admin-text);
        font-size: 1.5rem;
      }

      .topbar__actions {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .topbar__identity {
        display: grid;
        gap: 0.1rem;
        padding: 0.55rem 0.9rem;
        border: 1px solid var(--admin-border);
        border-radius: 1rem;
        background: color-mix(in srgb, var(--admin-panel-soft) 82%, transparent);
        text-align: start;
      }

      .topbar__identity span {
        color: var(--admin-muted);
        font-size: 0.72rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .topbar__identity strong {
        color: var(--admin-text);
        font-size: 0.95rem;
      }

      a,
      button {
        border-radius: 999px;
        padding: 0.75rem 1rem;
        border: 1px solid var(--admin-border);
        background: color-mix(in srgb, var(--admin-panel-soft) 76%, transparent);
        text-decoration: none;
        color: var(--admin-text);
        font-weight: 600;
      }

      @media (max-width: 900px) {
        .topbar {
          flex-direction: column;
          align-items: start;
        }
      }
    `,
  ],
})
export class AdminTopbarComponent {
  readonly session = inject(AuthSessionService);
  readonly shell = inject(AppShellService);
  readonly theme = inject(PublicThemeService);
  readonly isLoggingOut = signal(false);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly copy = computed(() => getPortfolioCopy(this.theme.language(), 'adminTopbar'));
  private readonly routeLabel = toSignal(
    combineLatest([
      this.shell.adminShell$.pipe(catchError(() => of(null))),
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.router.url),
        startWith(this.router.url),
      ),
    ]).pipe(map(([shell, url]) => this.resolveSectionLabel(url, shell?.routes ?? []))),
    { initialValue: this.formatFallbackSection(this.router.url) },
  );

  readonly currentSection = computed(() => this.routeLabel());

  logout(): void {
    if (this.isLoggingOut()) {
      return;
    }

    this.isLoggingOut.set(true);
    this.session
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.isLoggingOut.set(false),
        error: () => this.isLoggingOut.set(false),
      });
  }

  private resolveSectionLabel(
    url: string,
    routes: ReadonlyArray<{ path: string; label: string }>,
  ): string {
    const cleanUrl = url.split('?')[0];
    const matchedRoute =
      routes.find(route => route.path === cleanUrl) ??
      routes.find(route => route.path.endsWith('/:slug') && cleanUrl.startsWith(route.path.replace('/:slug', '')));

    return matchedRoute?.label ?? this.formatFallbackSection(cleanUrl);
  }

  private formatFallbackSection(url: string): string {
    const segment = url.split('/').filter(Boolean).at(-1) ?? 'dashboard';
    return segment
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
