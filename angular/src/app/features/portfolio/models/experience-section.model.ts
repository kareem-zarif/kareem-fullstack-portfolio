export interface PortfolioExperienceHighlightBadge {
  type: number;
  label: string;
  displayOrder: number;
}

export interface PortfolioExperienceTimelineItem {
  type: number;
  typeLabel: string;
  stageLabel: string;
  title: string;
  organization: string;
  summary: string;
  businessValue: string;
  highlights: string[];
  isPrimaryProfessionalExperience: boolean;
  displayOrder: number;
}

export interface PortfolioExperienceSection {
  headline: string;
  summary: string;
  timelineItems: PortfolioExperienceTimelineItem[];
  highlightBadges: PortfolioExperienceHighlightBadge[];
}
