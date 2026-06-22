import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { GetPortfolioProjectListInput, PortfolioProjectList } from '@features/portfolio/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PortfolioProjectsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apis.default.url.replace(/\/$/, '');

  getProjectList(input: GetPortfolioProjectListInput = {}): Observable<PortfolioProjectList> {
    let params = new HttpParams();

    if (input.projectType) {
      params = params.set('projectType', String(input.projectType));
    }

    if (input.technology?.trim()) {
      params = params.set('technology', input.technology.trim());
    }

    return this.http.get<PortfolioProjectList>(`${this.apiBaseUrl}/api/projects`, { params });
  }
}
