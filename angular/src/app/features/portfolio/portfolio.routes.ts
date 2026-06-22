import { Routes } from '@angular/router';
import { PublicLayoutComponent } from '@shared/layouts/public/public-layout.component';

export const PORTFOLIO_ROUTES: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/portfolio/pages/home/home-page.component').then(c => c.HomePageComponent),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('@features/portfolio/pages/projects/projects-page.component').then(c => c.ProjectsPageComponent),
      },
      {
        path: 'projects/:slug',
        loadComponent: () =>
          import('@features/portfolio/pages/project-details/project-details-page.component').then(
            c => c.ProjectDetailsPageComponent,
          ),
      },
      {
        path: 'experience',
        loadComponent: () =>
          import('@features/portfolio/pages/experience/experience-page.component').then(
            c => c.ExperiencePageComponent,
          ),
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('@features/portfolio/pages/contact/contact-page.component').then(c => c.ContactPageComponent),
      },
    ],
  },
];
