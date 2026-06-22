import { authGuard } from '@abp/ng.core';
import { Routes } from '@angular/router';
import { adminAuthMatchGuard } from '@core/guards/admin-auth.guard';

export const APP_ROUTES: Routes = [
  {
    path: 'admin/login',
    loadComponent: () =>
      import('@features/admin/pages/login/admin-login-page.component').then(c => c.AdminLoginPageComponent),
  },
  {
    path: 'admin',
    canMatch: [adminAuthMatchGuard],
    loadChildren: () => import('@features/admin/admin.routes').then(c => c.ADMIN_ROUTES),
  },
  {
    path: 'account',
    loadChildren: () => import('@abp/ng.account').then(c => c.createRoutes()),
  },
  {
    path: 'identity',
    canActivate: [authGuard],
    loadChildren: () => import('@abp/ng.identity').then(c => c.createRoutes()),
  },
  {
    path: 'setting-management',
    canActivate: [authGuard],
    loadChildren: () => import('@abp/ng.setting-management').then(c => c.createRoutes()),
  },
  {
    path: '',
    loadChildren: () => import('@features/portfolio/portfolio.routes').then(c => c.PORTFOLIO_ROUTES),
  },
  {
    path: '**',
    loadComponent: () =>
      import('@shared/pages/not-found-page.component').then(c => c.NotFoundPageComponent),
  },
];
