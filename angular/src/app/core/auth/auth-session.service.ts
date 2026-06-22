import { Injectable, inject } from '@angular/core';
import { AuthService } from '@abp/ng.core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  login(returnUrl = '/admin/dashboard'): void {
    this.authService.navigateToLogin({ returnUrl });
  }

  openAdmin(): void {
    void this.router.navigateByUrl('/admin/dashboard');
  }

  navigateToAccount(): void {
    void this.router.navigateByUrl('/account/manage');
  }
}
