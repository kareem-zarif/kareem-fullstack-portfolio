import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { AdminSessionStore } from '@core/auth/admin-session.store';
import { PublicThemeService } from '@core/services/public-theme.service';

@Injectable()
export class PortfolioRequestContextInterceptor implements HttpInterceptor {
  private readonly theme = inject(PublicThemeService);
  private readonly adminSession = inject(AdminSessionStore);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const normalizedUrl = request.url.toLowerCase();
    const apiBaseUrl = environment.apis.default.url.replace(/\/$/, '').toLowerCase();
    const targetsApi =
      normalizedUrl.startsWith(apiBaseUrl) ||
      normalizedUrl.startsWith('/api') ||
      normalizedUrl.includes('/api/');

    if (!targetsApi) {
      return next.handle(request);
    }

    const targetsAdminApi =
      normalizedUrl.startsWith(`${apiBaseUrl}/api/admin/`) ||
      normalizedUrl.startsWith(`${apiBaseUrl}/api/app/admin`) ||
      normalizedUrl.includes('/api/admin/') ||
      normalizedUrl.includes('/api/app/admin');

    const accessToken = targetsAdminApi ? this.adminSession.accessToken : null;
    const setHeaders: Record<string, string> = {
      'Accept-Language': this.theme.language(),
      'X-Portfolio-Client': 'angular-host',
    };

    if (accessToken) {
      setHeaders['Authorization'] = `Bearer ${accessToken}`;
    }

    return next.handle(
      request.clone({
        setHeaders,
      }),
    );
  }
}
