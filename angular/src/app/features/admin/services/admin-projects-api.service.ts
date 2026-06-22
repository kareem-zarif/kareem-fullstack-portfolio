import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import {
  AdminCreateUpdatePortfolioProjectRequest,
  AdminPortfolioProject,
  AdminPortfolioProjectList,
  AdminPortfolioProjectListFilters,
  AdminSetPortfolioProjectFeaturedStatusRequest,
  AdminSetPortfolioProjectPublicationStatusRequest,
} from '@features/admin/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminProjectsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apis.default.url.replace(/\/$/, '');

  getList(filters: AdminPortfolioProjectListFilters = {}): Observable<AdminPortfolioProjectList> {
    let params = new HttpParams();

    if (filters.searchText?.trim()) {
      params = params.set('searchText', filters.searchText.trim());
    }

    if (filters.projectType != null) {
      params = params.set('projectType', String(filters.projectType));
    }

    if (filters.isActive != null) {
      params = params.set('isActive', String(filters.isActive));
    }

    if (filters.isFeatured != null) {
      params = params.set('isFeatured', String(filters.isFeatured));
    }

    return this.http.get<AdminPortfolioProjectList>(`${this.apiBaseUrl}/api/admin/projects`, { params });
  }

  get(id: string): Observable<AdminPortfolioProject> {
    return this.http.get<AdminPortfolioProject>(`${this.apiBaseUrl}/api/admin/projects/${encodeURIComponent(id)}`);
  }

  create(input: AdminCreateUpdatePortfolioProjectRequest): Observable<AdminPortfolioProject> {
    return this.http.post<AdminPortfolioProject>(`${this.apiBaseUrl}/api/admin/projects`, input);
  }

  update(id: string, input: AdminCreateUpdatePortfolioProjectRequest): Observable<AdminPortfolioProject> {
    return this.http.put<AdminPortfolioProject>(`${this.apiBaseUrl}/api/admin/projects/${encodeURIComponent(id)}`, input);
  }

  setPublicationStatus(
    id: string,
    input: AdminSetPortfolioProjectPublicationStatusRequest,
  ): Observable<AdminPortfolioProject> {
    return this.http.patch<AdminPortfolioProject>(
      `${this.apiBaseUrl}/api/admin/projects/${encodeURIComponent(id)}/publication-status`,
      input,
    );
  }

  setFeaturedStatus(
    id: string,
    input: AdminSetPortfolioProjectFeaturedStatusRequest,
  ): Observable<AdminPortfolioProject> {
    return this.http.patch<AdminPortfolioProject>(
      `${this.apiBaseUrl}/api/admin/projects/${encodeURIComponent(id)}/featured-status`,
      input,
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/admin/projects/${encodeURIComponent(id)}`);
  }
}
