import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PublicThemeService } from '@core/services/public-theme.service';

@Injectable()
export class PortfolioRequestContextInterceptor implements HttpInterceptor {
  private readonly theme = inject(PublicThemeService);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const targetsApi =
      request.url.startsWith(environment.apis.default.url) ||
      request.url.startsWith('/api') ||
      request.url.includes('/api/');

    if (!targetsApi) {
      return next.handle(request);
    }

    return next.handle(
      request.clone({
        setHeaders: {
          'Accept-Language': this.theme.language(),
          'X-Portfolio-Client': 'angular-host',
        },
      }),
    );
  }
}
