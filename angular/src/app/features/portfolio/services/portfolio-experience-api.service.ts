import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { PortfolioExperienceSection } from '@features/portfolio/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PortfolioExperienceApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apis.default.url.replace(/\/$/, '');

  getExperienceSection(): Observable<PortfolioExperienceSection> {
    return this.http.get<PortfolioExperienceSection>(`${this.apiBaseUrl}/api/experience`);
  }
}
