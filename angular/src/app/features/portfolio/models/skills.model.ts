export interface PortfolioSkillItem {
  id: string;
  name: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface PortfolioSkillCategoryGroup {
  category: number;
  categoryLabel: string;
  skills: PortfolioSkillItem[];
}

export interface PortfolioSkillAdminItem {
  id: string;
  name: string;
  category: number;
  categoryLabel: string;
  isPrimary: boolean;
  isActive: boolean;
  displayOrder: number;
}
