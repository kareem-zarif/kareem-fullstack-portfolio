export interface AdminPortfolioExperience {
  id: string;
  type: number;
  typeLabel: string;
  stageLabel: string;
  title: string;
  organization: string;
  summary: string;
  businessValue: string;
  highlights: string[];
  isPrimaryProfessionalExperience: boolean;
  isActive: boolean;
  displayOrder: number;
}

export interface AdminCreateUpdatePortfolioExperienceRequest {
  type: number;
  stageLabel: string;
  title: string;
  organization: string;
  summary: string;
  businessValue: string;
  highlights: string[];
  isPrimaryProfessionalExperience: boolean;
  isActive: boolean;
  displayOrder: number;
}
