import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import {
  AdminCreateUpdatePortfolioSkillRequest,
  AdminPortfolioSkill,
} from '@features/admin/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminSkillsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apis.default.url.replace(/\/$/, '');

  getList(): Observable<AdminPortfolioSkill[]> {
    return this.http.get<AdminPortfolioSkill[]>(`${this.apiBaseUrl}/api/admin/skills`);
  }

  get(id: string): Observable<AdminPortfolioSkill> {
    return this.http.get<AdminPortfolioSkill>(`${this.apiBaseUrl}/api/admin/skills/${encodeURIComponent(id)}`);
  }

  create(input: AdminCreateUpdatePortfolioSkillRequest): Observable<AdminPortfolioSkill> {
    return this.http.post<AdminPortfolioSkill>(`${this.apiBaseUrl}/api/admin/skills`, input);
  }

  update(id: string, input: AdminCreateUpdatePortfolioSkillRequest): Observable<AdminPortfolioSkill> {
    return this.http.put<AdminPortfolioSkill>(`${this.apiBaseUrl}/api/admin/skills/${encodeURIComponent(id)}`, input);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/admin/skills/${encodeURIComponent(id)}`);
  }
}
