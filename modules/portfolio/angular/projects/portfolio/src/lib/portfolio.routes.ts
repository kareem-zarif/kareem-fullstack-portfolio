import { RouterOutletComponent } from '@abp/ng.core';
import { Routes } from '@angular/router';

export const PORTFOLIO_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: RouterOutletComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/portfolio.component').then(c => c.portfolioComponent),
      },
    ],
  },
];
