import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { AdminDashboardOverview } from '@features/admin/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminDashboardFacade {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apis.default.url.replace(/\/$/, '');

  getOverview(): Observable<AdminDashboardOverview> {
    return this.http.get<AdminDashboardOverview>(`${this.apiBaseUrl}/api/admin/dashboard/overview`);
  }
}
