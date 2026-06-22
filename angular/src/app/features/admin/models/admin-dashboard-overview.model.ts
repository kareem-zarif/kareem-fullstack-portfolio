import { AdminDashboardMetric } from './admin-dashboard-metric.model';

export interface AdminDashboardRecentMessage {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  subject: string;
  messagePreview: string;
  isRead: boolean;
  creationTime: string;
}

export interface AdminDashboardQuickAction {
  routeType: number;
  label: string;
  path: string;
  requiredPermissionName: string;
  displayOrder: number;
}

export interface AdminDashboardOverview {
  generatedAtUtc: string;
  hasRecentMessages: boolean;
  metrics: AdminDashboardMetric[];
  recentMessages: AdminDashboardRecentMessage[];
  quickActions: AdminDashboardQuickAction[];
}
