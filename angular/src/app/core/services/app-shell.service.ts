import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  PortfolioAppShellModel,
  PortfolioFooterLinkModel,
} from '@core/models/app-navigation.model';
import { PublicThemeService } from '@core/services/public-theme.service';
import { environment } from '@env/environment';
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppShellService {
  private readonly http = inject(HttpClient);
  private readonly theme = inject(PublicThemeService);
  private readonly apiBaseUrl = environment.apis.default.url.replace(/\/$/, '');

  private readonly language$ = toObservable(this.theme.language).pipe(distinctUntilChanged());

  readonly publicShell$ = this.language$.pipe(
    switchMap(() =>
      this.http.get<PortfolioAppShellModel>(`${this.apiBaseUrl}/api/app/public-portfolio-app-shell`),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly adminShell$ = this.language$.pipe(
    switchMap(() =>
      this.http.get<PortfolioAppShellModel>(`${this.apiBaseUrl}/api/app/admin-portfolio-app-shell`),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly publicNavigation$ = this.publicShell$.pipe(
    map(shell =>
      shell.navigationItems.map(item => ({
        label: item.label,
        path: item.path,
        exactMatch: item.exactMatch,
        icon: this.getNavigationIcon(item.path),
      })),
    ),
  );

  readonly adminNavigation$ = this.adminShell$.pipe(
    map(shell =>
      shell.navigationItems.map(item => ({
        label: item.label,
        path: item.path,
        exactMatch: item.exactMatch,
        icon: this.getNavigationIcon(item.path),
      })),
    ),
  );

  readonly publicFooterLinks$ = this.publicShell$.pipe(map(shell => shell.footerLinks));

  resolveFooterHref(link: PortfolioFooterLinkModel): string | null {
    if (!link.url) {
      return null;
    }

    if (link.type === 3 && !link.url.toLowerCase().startsWith('mailto:')) {
      return `mailto:${link.url}`;
    }

    return link.url;
  }

  isDownloadLink(link: PortfolioFooterLinkModel): boolean {
    return link.type === 4;
  }

  private getNavigationIcon(path: string): string {
    switch (path) {
      case '/':
        return 'bi bi-house-door';
      case '/projects':
        return 'bi bi-grid';
      case '/experience':
        return 'bi bi-briefcase';
      case '/contact':
        return 'bi bi-chat-square-text';
      case '/admin/dashboard':
        return 'bi bi-speedometer2';
      case '/admin/projects':
        return 'bi bi-kanban';
      case '/admin/skills':
        return 'bi bi-lightning-charge';
      case '/admin/experience':
        return 'bi bi-diagram-3';
      case '/admin/messages':
        return 'bi bi-envelope-paper';
      default:
        return 'bi bi-arrow-up-right';
    }
  }
}
