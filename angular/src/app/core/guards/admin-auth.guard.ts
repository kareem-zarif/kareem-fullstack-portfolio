import { inject } from '@angular/core';
import { AuthService } from '@abp/ng.core';
import { CanActivateChildFn, CanMatchFn, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';

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
  const authService = inject(AuthService);

  if (authService.isAuthenticated) {
    return true;
  }

  return handleUnauthorized(buildReturnUrlFromSegments(segments));
};

export const adminAuthChildGuard: CanActivateChildFn = (_route, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);

  if (authService.isAuthenticated) {
    return true;
  }

  return handleUnauthorized(state.url || '/admin/dashboard');
};
