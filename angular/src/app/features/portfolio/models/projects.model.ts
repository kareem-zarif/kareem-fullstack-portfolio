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
