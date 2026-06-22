import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Project } from '@shared/models';

@Injectable({ providedIn: 'root' })
export class PortfolioProjectsService {
  private readonly projects: Project[] = [
    {
      id: 'proj-erp-host',
      slug: 'enterprise-angular-host',
      title: 'Enterprise Angular Host',
      summary: 'ABP Angular host with modular frontend architecture and admin workspace.',
      description:
        'A scalable Angular host that separates public marketing experiences from authenticated admin workflows while preserving ABP authentication and configuration bootstrapping.',
      category: 'Architecture',
      status: 'InProgress',
      featured: true,
      techStack: ['Angular 21', 'ABP', 'SCSS', 'TypeScript'],
      updatedAt: '2026-06-20',
    },
    {
      id: 'proj-api-suite',
      slug: 'backend-integration-suite',
      title: 'Backend Integration Suite',
      summary: 'API-first backend integrations with clean contracts for frontend consumption.',
      description:
        'A service-oriented platform focused on typed integration boundaries, maintainable request flows, and predictable deployment-ready structure.',
      category: 'Backend',
      status: 'Live',
      featured: true,
      techStack: ['.NET', 'ABP', 'SQL Server', 'REST'],
      repositoryUrl: 'https://github.com/example/backend-integration-suite',
      updatedAt: '2026-05-28',
    },
    {
      id: 'proj-analytics',
      slug: 'portfolio-analytics-console',
      title: 'Portfolio Analytics Console',
      summary: 'Operational dashboard for tracking messages, delivery signals, and content freshness.',
      description:
        'A console-style admin experience that highlights content health, audience signals, and operational follow-ups in a compact workspace.',
      category: 'Admin',
      status: 'Draft',
      featured: false,
      techStack: ['Angular', 'Signals', 'RxJS'],
      updatedAt: '2026-06-18',
    },
  ];

  getProjects(): Observable<Project[]> {
    return of(this.projects);
  }

  getFeaturedProjects(): Observable<Project[]> {
    return of(this.projects.filter(project => project.featured));
  }

  getProjectBySlug(slug: string): Observable<Project | undefined> {
    return of(this.projects.find(project => project.slug === slug));
  }
}
