export interface AppNavigationItem {
  label: string;
  path: string;
  exactMatch: boolean;
  icon?: string;
  description?: string;
}

export interface PortfolioLayoutModel {
  type: number;
  label: string;
  isAdmin: boolean;
}

export interface PortfolioRouteModel {
  type: number;
  label: string;
  path: string;
  layout: number;
  layoutLabel: string;
  requiresAuthentication: boolean;
  requiredPermissionName?: string | null;
  isNavigationVisible: boolean;
  exactMatch: boolean;
  displayOrder: number;
}

export interface PortfolioNavigationItemModel {
  routeType: number;
  label: string;
  path: string;
  exactMatch: boolean;
  displayOrder: number;
}

export interface PortfolioFooterLinkModel {
  type: number;
  label: string;
  url: string;
  isExternal: boolean;
  isConfigured: boolean;
  displayOrder: number;
}

export interface PortfolioAppShellModel {
  brandName: string;
  layout: PortfolioLayoutModel;
  routes: PortfolioRouteModel[];
  navigationItems: PortfolioNavigationItemModel[];
  footerLinks: PortfolioFooterLinkModel[];
}
