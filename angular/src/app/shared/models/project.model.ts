export interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  status: 'Draft' | 'InProgress' | 'Live';
  featured: boolean;
  techStack: string[];
  liveUrl?: string;
  repositoryUrl?: string;
  updatedAt: string;
}
