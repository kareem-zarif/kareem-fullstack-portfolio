import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ExperienceItem } from '@shared/models';

@Injectable({ providedIn: 'root' })
export class PortfolioExperienceService {
  private readonly experience: ExperienceItem[] = [
    {
      id: 'exp-lead-engineer',
      company: 'Product Delivery Studio',
      role: 'Senior Full-Stack Engineer',
      startDate: '2024-01-01',
      location: 'Remote',
      summary: 'Led ERP-style frontend and backend delivery with a focus on maintainable architecture and production readiness.',
      achievements: [
        'Built modular Angular and ABP application structures for internal tools.',
        'Introduced reusable design patterns that reduced feature onboarding time.',
      ],
      current: true,
    },
    {
      id: 'exp-platform',
      company: 'Digital Transformation Lab',
      role: 'Software Engineer',
      startDate: '2021-03-01',
      endDate: '2023-12-31',
      location: 'Cairo, Egypt',
      summary: 'Delivered line-of-business platforms across integration-heavy and operationally complex workflows.',
      achievements: [
        'Owned API integrations and frontend experience consistency.',
        'Improved internal dashboard usability for business teams.',
      ],
      current: false,
    },
  ];

  getExperience(): Observable<ExperienceItem[]> {
    return of(this.experience);
  }

  getExperienceHighlights(): Observable<ExperienceItem[]> {
    return of(this.experience.slice(0, 2));
  }
}
