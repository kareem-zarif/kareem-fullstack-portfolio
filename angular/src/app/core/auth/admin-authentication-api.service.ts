import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  AdminCurrentUserModel,
  AdminLoginRequestModel,
  AdminLoginResultModel,
} from '@core/auth/admin-auth.models';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminAuthenticationApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apis.default.url.replace(/\/$/, '');

  login(input: AdminLoginRequestModel): Observable<AdminLoginResultModel> {
    return this.http.post<AdminLoginResultModel>(`${this.apiBaseUrl}/api/admin/authentication/login`, input);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiBaseUrl}/api/admin/authentication/logout`, {});
  }

  getCurrent(): Observable<AdminCurrentUserModel> {
    return this.http.get<AdminCurrentUserModel>(`${this.apiBaseUrl}/api/admin/authentication/current`);
  }
}
