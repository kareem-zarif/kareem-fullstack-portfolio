export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  location: string;
  summary: string;
  achievements: string[];
  current: boolean;
}
