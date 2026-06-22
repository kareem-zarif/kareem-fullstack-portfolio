export interface AdminPortfolioProjectTypeFilterOption {
  value: number;
  label: string;
}

export interface AdminPortfolioProjectListItem {
  id: string;
  title: string;
  slug: string;
  projectType: number;
  projectTypeLabel: string;
  shortSummaryPreview: string;
  isShortSummaryTruncated: boolean;
  businessValuePreview: string;
  isBusinessValueTruncated: boolean;
  techStack: string[];
  isFeatured: boolean;
  isActive: boolean;
  hasCaseStudyContent: boolean;
  caseStudyRoute: string;
  displayOrder: number;
}

export interface AdminPortfolioProjectList {
  items: AdminPortfolioProjectListItem[];
  availableProjectTypes: AdminPortfolioProjectTypeFilterOption[];
  appliedSearchText?: string | null;
  appliedProjectType?: number | null;
  appliedIsActive?: boolean | null;
  appliedIsFeatured?: boolean | null;
  totalCount: number;
}

export interface AdminPortfolioProjectCaseStudyHighlightCard {
  type: number;
  label: string;
  title: string;
  summary: string;
  displayOrder: number;
}

export interface AdminPortfolioProjectCaseStudyGalleryItem {
  type: number;
  typeLabel: string;
  title: string;
  summary: string;
  imageUrl?: string | null;
  hasImage: boolean;
  displayOrder: number;
}

export interface AdminPortfolioProjectCaseStudy {
  overview: string;
  businessProblem: string;
  solution: string;
  roleSummary: string;
  roleResponsibilities: string[];
  keyFeatures: string[];
  architectureNotes: string[];
  highlightCards: AdminPortfolioProjectCaseStudyHighlightCard[];
  galleryItems: AdminPortfolioProjectCaseStudyGalleryItem[];
  results: string[];
}

export interface AdminPortfolioProject {
  id: string;
  title: string;
  slug: string;
  projectType: number;
  projectTypeLabel: string;
  shortSummary: string;
  businessValue: string;
  techStack: string[];
  isFeatured: boolean;
  isActive: boolean;
  gitHubUrl?: string | null;
  liveDemoUrl?: string | null;
  caseStudyRoute: string;
  hasCaseStudyContent: boolean;
  displayOrder: number;
  caseStudy: AdminPortfolioProjectCaseStudy;
}

export interface AdminCreateUpdatePortfolioProjectCaseStudyHighlightCardRequest {
  type: number;
  title: string;
  summary: string;
  displayOrder: number;
}

export interface AdminCreateUpdatePortfolioProjectCaseStudyGalleryItemRequest {
  type: number;
  title: string;
  summary: string;
  imageUrl?: string | null;
  displayOrder: number;
}

export interface AdminCreateUpdatePortfolioProjectCaseStudyRequest {
  overview: string;
  businessProblem: string;
  solution: string;
  roleSummary: string;
  roleResponsibilities: string[];
  keyFeatures: string[];
  architectureNotes: string[];
  highlightCards: AdminCreateUpdatePortfolioProjectCaseStudyHighlightCardRequest[];
  galleryItems: AdminCreateUpdatePortfolioProjectCaseStudyGalleryItemRequest[];
  results: string[];
}

export interface AdminCreateUpdatePortfolioProjectRequest {
  title: string;
  slug: string;
  projectType: number;
  shortSummary: string;
  businessValue: string;
  techStack: string[];
  isFeatured: boolean;
  isActive: boolean;
  gitHubUrl?: string | null;
  liveDemoUrl?: string | null;
  displayOrder: number;
  caseStudy: AdminCreateUpdatePortfolioProjectCaseStudyRequest;
}

export interface AdminPortfolioProjectListFilters {
  searchText?: string | null;
  projectType?: number | null;
  isActive?: boolean | null;
  isFeatured?: boolean | null;
}

export interface AdminSetPortfolioProjectPublicationStatusRequest {
  isActive: boolean;
}

export interface AdminSetPortfolioProjectFeaturedStatusRequest {
  isFeatured: boolean;
}
