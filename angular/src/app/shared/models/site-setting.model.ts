export interface SiteSetting {
  id: string;
  key: string;
  label: string;
  value: string;
  group: 'branding' | 'contact' | 'status';
}
