import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { SiteSetting } from '@shared/models';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SiteSettingsService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apis.default.url.replace(/\/$/, '');

  getSiteSettings(): Observable<SiteSetting[]> {
    return this.http.get<PublicPortfolioSiteSettingDto[]>(`${this.apiBaseUrl}/api/site-settings`).pipe(
      map(settings =>
        settings.map(setting => ({
          key: setting.key,
          label: formatSettingLabel(setting.key),
          value: setting.value,
          valueType: setting.valueType,
          valueTypeLabel: setting.valueTypeLabel,
          displayOrder: setting.displayOrder,
        })),
      ),
    );
  }
}

interface PublicPortfolioSiteSettingDto {
  key: string;
  value: string;
  valueType: number;
  valueTypeLabel: string;
  displayOrder: number;
}

function formatSettingLabel(key: string): string {
  return key
    .split('.')
    .map(segment =>
      segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
    )
    .join(' / ');
}
