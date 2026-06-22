import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import {
  AdminCreateUpdatePortfolioExperienceRequest,
  AdminPortfolioExperience,
} from '@features/admin/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminExperienceApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apis.default.url.replace(/\/$/, '');

  getList(): Observable<AdminPortfolioExperience[]> {
    return this.http.get<AdminPortfolioExperience[]>(`${this.apiBaseUrl}/api/admin/experience`);
  }

  get(id: string): Observable<AdminPortfolioExperience> {
    return this.http.get<AdminPortfolioExperience>(
      `${this.apiBaseUrl}/api/admin/experience/${encodeURIComponent(id)}`,
    );
  }

  create(input: AdminCreateUpdatePortfolioExperienceRequest): Observable<AdminPortfolioExperience> {
    return this.http.post<AdminPortfolioExperience>(`${this.apiBaseUrl}/api/admin/experience`, input);
  }

  update(
    id: string,
    input: AdminCreateUpdatePortfolioExperienceRequest,
  ): Observable<AdminPortfolioExperience> {
    return this.http.put<AdminPortfolioExperience>(
      `${this.apiBaseUrl}/api/admin/experience/${encodeURIComponent(id)}`,
      input,
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/admin/experience/${encodeURIComponent(id)}`);
  }
}
