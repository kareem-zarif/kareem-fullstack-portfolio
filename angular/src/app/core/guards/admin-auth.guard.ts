import { inject } from '@angular/core';
import { AuthService } from '@abp/ng.core';
import { CanActivateChildFn, CanMatchFn, RouterStateSnapshot, UrlSegment } from '@angular/router';

function buildReturnUrlFromSegments(segments: UrlSegment[]): string {
  const candidate = segments.map(segment => segment.path).join('/');
  return candidate ? `/${candidate}` : '/admin/dashboard';
}

function handleUnauthorized(returnUrl: string): false {
  inject(AuthService).navigateToLogin({ returnUrl });
  return false;
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
