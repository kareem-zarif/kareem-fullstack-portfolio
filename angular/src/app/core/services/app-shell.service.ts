import { Injectable } from '@angular/core';
import { AppNavigationItem } from '@core/models/app-navigation.model';

@Injectable({ providedIn: 'root' })
export class AppShellService {
  readonly publicNavigation: readonly AppNavigationItem[] = [
    { label: 'Home', route: '/', icon: 'bi bi-house-door' },
    { label: 'Projects', route: '/projects', icon: 'bi bi-grid-1x2' },
    { label: 'Experience', route: '/experience', icon: 'bi bi-briefcase' },
    { label: 'Contact', route: '/contact', icon: 'bi bi-chat-dots' },
  ];

  readonly adminNavigation: readonly AppNavigationItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'bi bi-speedometer2' },
    { label: 'Projects', route: '/admin/projects', icon: 'bi bi-kanban' },
    { label: 'Skills', route: '/admin/skills', icon: 'bi bi-lightning-charge' },
    { label: 'Experience', route: '/admin/experience', icon: 'bi bi-clock-history' },
    { label: 'Messages', route: '/admin/messages', icon: 'bi bi-envelope-paper' },
  ];
}
