import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

@Injectable()
export class PortfolioRequestContextInterceptor implements HttpInterceptor {
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
          'X-Portfolio-Client': 'angular-host',
        },
      }),
    );
  }
}
