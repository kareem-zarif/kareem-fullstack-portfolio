import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SiteSetting } from '@shared/models';

@Injectable({ providedIn: 'root' })
export class SiteSettingsService {
  private readonly settings: SiteSetting[] = [
    { id: 'setting-brand', key: 'brandName', label: 'Brand Name', value: 'Kareem Zarif', group: 'branding' },
    { id: 'setting-role', key: 'headline', label: 'Headline', value: 'Full-Stack Engineer building ERP-grade product experiences.', group: 'branding' },
    { id: 'setting-email', key: 'email', label: 'Email', value: 'hello@kareem.dev', group: 'contact' },
    { id: 'setting-location', key: 'location', label: 'Location', value: 'Cairo, Egypt', group: 'contact' },
    { id: 'setting-status', key: 'availability', label: 'Availability', value: 'Available for selective product and platform work.', group: 'status' },
  ];

  getSiteSettings(): Observable<SiteSetting[]> {
    return of(this.settings);
  }
}
