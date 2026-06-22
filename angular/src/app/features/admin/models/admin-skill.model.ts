export interface AdminPortfolioSkill {
  id: string;
  name: string;
  category: number;
  categoryLabel: string;
  isPrimary: boolean;
  isActive: boolean;
  displayOrder: number;
}

export interface AdminCreateUpdatePortfolioSkillRequest {
  name: string;
  category: number;
  isPrimary: boolean;
  isActive: boolean;
  displayOrder: number;
}
