import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Skill } from '@shared/models';

@Injectable({ providedIn: 'root' })
export class PortfolioSkillsService {
  private readonly skills: Skill[] = [
    { id: 'skill-angular', name: 'Angular', category: 'Frontend', level: 'Expert', featured: true, yearsOfExperience: 5 },
    { id: 'skill-abp', name: 'ABP Framework', category: 'Architecture', level: 'Advanced', featured: true, yearsOfExperience: 3 },
    { id: 'skill-dotnet', name: '.NET', category: 'Backend', level: 'Expert', featured: true, yearsOfExperience: 6 },
    { id: 'skill-sql', name: 'SQL Server', category: 'Data', level: 'Advanced', featured: false, yearsOfExperience: 5 },
    { id: 'skill-ux', name: 'Enterprise UX', category: 'Design', level: 'Advanced', featured: false, yearsOfExperience: 4 },
  ];

  getSkills(): Observable<Skill[]> {
    return of(this.skills);
  }

  getFeaturedSkills(): Observable<Skill[]> {
    return of(this.skills.filter(skill => skill.featured));
  }
}
