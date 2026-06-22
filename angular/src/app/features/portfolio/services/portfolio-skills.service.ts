import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import {
  PortfolioSkillAdminItem,
  PortfolioSkillCategoryGroup,
  PortfolioSkillItem,
} from '@features/portfolio/models/skills.model';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PortfolioSkillsService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apis.default.url.replace(/\/$/, '');

  getSkillCategories(): Observable<PortfolioSkillCategoryGroup[]> {
    return this.http.get<PortfolioSkillCategoryGroup[]>(`${this.apiBaseUrl}/api/skills`);
  }

  getFeaturedSkills(): Observable<PortfolioSkillItem[]> {
    return this.getSkillCategories().pipe(
      map(categories => categories.flatMap(category => category.skills.filter(skill => skill.isPrimary))),
    );
  }

  getAdminSkills(): Observable<PortfolioSkillAdminItem[]> {
    return this.http.get<PortfolioSkillAdminItem[]>(`${this.apiBaseUrl}/api/admin/skills`);
  }
}
