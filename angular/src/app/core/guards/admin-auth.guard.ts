import { inject } from '@angular/core';
import { CanActivateChildFn, CanMatchFn, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { AuthSessionService } from '@core/auth/auth-session.service';

function buildReturnUrlFromSegments(segments: UrlSegment[]): string {
  const candidate = segments.map(segment => segment.path).join('/');
  return candidate ? `/${candidate}` : '/admin/dashboard';
}

function handleUnauthorized(returnUrl: string) {
  return inject(Router).createUrlTree(['/admin/login'], {
    queryParams: { returnUrl },
  });
}

export const adminAuthMatchGuard: CanMatchFn = (_route, segments) => {
  const session = inject(AuthSessionService);

  if (session.isAuthenticated) {
    return true;
  }

  return handleUnauthorized(buildReturnUrlFromSegments(segments));
};

export const adminAuthChildGuard: CanActivateChildFn = (_route, state: RouterStateSnapshot) => {
  const session = inject(AuthSessionService);

  if (session.isAuthenticated) {
    return true;
  }

  return handleUnauthorized(state.url || '/admin/dashboard');
};
