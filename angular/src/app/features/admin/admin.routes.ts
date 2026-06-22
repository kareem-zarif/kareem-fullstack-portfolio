import { Routes } from '@angular/router';
import { adminAuthChildGuard } from '@core/guards/admin-auth.guard';
import { AdminLayoutComponent } from '@shared/layouts/admin/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivateChild: [adminAuthChildGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('@features/admin/pages/dashboard/dashboard-page.component').then(
            c => c.AdminDashboardPageComponent,
          ),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('@features/admin/pages/projects/admin-projects-page.component').then(
            c => c.AdminProjectsPageComponent,
          ),
      },
      {
        path: 'skills',
        loadComponent: () =>
          import('@features/admin/pages/skills/admin-skills-page.component').then(
            c => c.AdminSkillsPageComponent,
          ),
      },
      {
        path: 'experience',
        loadComponent: () =>
          import('@features/admin/pages/experience/admin-experience-page.component').then(
            c => c.AdminExperiencePageComponent,
          ),
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('@features/admin/pages/messages/admin-messages-page.component').then(
            c => c.AdminMessagesPageComponent,
          ),
      },
    ],
  },
];
