export enum PortfolioCallToActionType {
  ViewProjects = 1,
  DownloadCv = 2,
  ContactMe = 3,
  GitHub = 4,
}

export interface PortfolioCallToAction {
  type: PortfolioCallToActionType;
  label: string;
  url: string;
  isExternal: boolean;
  displayOrder: number;
  style: string;
}

export interface PortfolioTargetAudience {
  type: number;
  label: string;
}

export interface PortfolioIdentity {
  fullName: string;
  professionalTitle: string;
  mainMessage: string;
  businessSummary: string;
  visualDirection: string;
  targetAudiences: PortfolioTargetAudience[];
  callToActions: PortfolioCallToAction[];
}

export interface PortfolioHomeProfessionalLink {
  type: number;
  label: string;
  url: string;
  isExternal: boolean;
  displayOrder: number;
}

export interface PortfolioHomeTechStackCard {
  type: number;
  label: string;
  headline: string;
  summary: string;
  technologies: string[];
  displayOrder: number;
}

export interface PortfolioHomeFeaturedProject {
  type: number;
  typeLabel: string;
  title: string;
  slug: string;
  shortSummary: string;
  businessValue: string;
  techStack: string[];
  gitHubUrl?: string | null;
  hasGitHubLink: boolean;
  liveDemoUrl?: string | null;
  hasLiveDemoLink: boolean;
  caseStudyRoute: string;
  isFeatured: boolean;
  displayOrder: number;
}

export interface PortfolioHomeErpCapability {
  type: number;
  label: string;
}

export interface PortfolioHomeHighlightCard {
  type: number;
  label: string;
  title: string;
  summary: string;
  displayOrder: number;
}

export interface PortfolioHomeErpExperienceHighlight {
  headline: string;
  summary: string;
  capabilities: PortfolioHomeErpCapability[];
  architectureNote: string;
  highlightCards: PortfolioHomeHighlightCard[];
  projectRoute: string;
}

export interface PortfolioHomeBusinessValue {
  type: number;
  label: string;
  title: string;
  summary: string;
  displayOrder: number;
}

export interface PortfolioHomeContactCallToAction {
  title: string;
  summary: string;
  primaryAction: PortfolioCallToAction;
}

export interface PortfolioHomePage {
  identity: PortfolioIdentity;
  professionalLinks: PortfolioHomeProfessionalLink[];
  techStackCards: PortfolioHomeTechStackCard[];
  featuredProjects: PortfolioHomeFeaturedProject[];
  erpExperienceHighlight: PortfolioHomeErpExperienceHighlight;
  businessValueItems: PortfolioHomeBusinessValue[];
  contactCallToAction: PortfolioHomeContactCallToAction;
}
