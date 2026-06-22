export interface PortfolioProjectTypeFilterOption {
  value: number;
  label: string;
}

export interface PortfolioProjectCard {
  id: string;
  title: string;
  slug: string;
  projectType: number;
  projectTypeLabel: string;
  shortSummary: string;
  shortSummaryPreview: string;
  isShortSummaryTruncated: boolean;
  businessValue: string;
  businessValuePreview: string;
  isBusinessValueTruncated: boolean;
  techStack: string[];
  isFeatured: boolean;
  gitHubUrl?: string | null;
  hasGitHubLink: boolean;
  liveDemoUrl?: string | null;
  hasLiveDemoLink: boolean;
  caseStudyRoute: string;
  hasCaseStudyLink: boolean;
  displayOrder: number;
}

export interface PortfolioProjectList {
  items: PortfolioProjectCard[];
  availableProjectTypes: PortfolioProjectTypeFilterOption[];
  availableTechnologies: string[];
  appliedProjectType?: number | null;
  appliedTechnology?: string | null;
  hasActiveFilters: boolean;
}

export interface GetPortfolioProjectListInput {
  projectType?: number | null;
  technology?: string | null;
}

export const PORTFOLIO_PROJECT_CASE_STUDY_SECTION = {
  overview: 1,
  businessProblem: 2,
  solution: 3,
  kareemRole: 4,
  techStack: 5,
  keyFeatures: 6,
  architectureNotes: 7,
  gallery: 8,
  resultsImpact: 9,
  links: 10,
} as const;

export interface PortfolioProjectCaseStudy {
  id: string;
  title: string;
  slug: string;
  caseStudyRoute: string;
  projectType: number;
  projectTypeLabel: string;
  shortSummary: string;
  businessValue: string;
  overview: string;
  businessProblem: string;
  solution: string;
  roleSummary: string;
  roleResponsibilities: string[];
  techStack: string[];
  keyFeatures: string[];
  architectureNotes: string[];
  highlightCards: PortfolioProjectCaseStudyHighlightCard[];
  galleryItems: PortfolioProjectCaseStudyGalleryItem[];
  results: string[];
  links: PortfolioProjectCaseStudyLink[];
  sections: PortfolioProjectCaseStudySection[];
  isFeatured: boolean;
}

export interface PortfolioProjectCaseStudyHighlightCard {
  type: number;
  label: string;
  title: string;
  summary: string;
  displayOrder: number;
}

export interface PortfolioProjectCaseStudyGalleryItem {
  type: number;
  typeLabel: string;
  title: string;
  summary: string;
  imageUrl?: string | null;
  hasImage: boolean;
  displayOrder: number;
}

export interface PortfolioProjectCaseStudyLink {
  type: number;
  label: string;
  url: string;
  isExternal: boolean;
  displayOrder: number;
}

export interface PortfolioProjectCaseStudySection {
  type: number;
  label: string;
  isVisible: boolean;
  displayOrder: number;
}
