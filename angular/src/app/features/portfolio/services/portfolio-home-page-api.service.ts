import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { PortfolioHomePage, PortfolioIdentity } from '@features/portfolio/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PortfolioHomePageApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apis.default.url.replace(/\/$/, '');

  getHomePage(): Observable<PortfolioHomePage> {
    return this.http.get<PortfolioHomePage>(`${this.apiBaseUrl}/api/app/portfolio-home-page`);
  }

  getIdentity(): Observable<PortfolioIdentity> {
    return this.http.get<PortfolioIdentity>(`${this.apiBaseUrl}/api/app/portfolio-identity`);
  }
}
