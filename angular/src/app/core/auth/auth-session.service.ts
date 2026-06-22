import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminLoginRequestModel, AdminLoginResultModel } from '@core/auth/admin-auth.models';
import { AdminAuthenticationApiService } from '@core/auth/admin-authentication-api.service';
import { AdminSessionStore } from '@core/auth/admin-session.store';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly api = inject(AdminAuthenticationApiService);
  private readonly store = inject(AdminSessionStore);
  private readonly router = inject(Router);

  get isAuthenticated(): boolean {
    return this.store.isAuthenticated;
  }

  get currentUser() {
    return this.store.currentUser;
  }

  openAdmin(): void {
    if (!this.isAuthenticated) {
      this.openAdminLogin();
      return;
    }

    void this.router.navigateByUrl('/admin/dashboard');
  }

  openAdminLogin(returnUrl = '/admin/dashboard'): void {
    void this.router.navigate(['/admin/login'], {
      queryParams: { returnUrl },
    });
  }

  signIn(
    credentials: AdminLoginRequestModel,
    returnUrl = '/admin/dashboard',
  ): Observable<AdminLoginResultModel> {
    return this.api.login(credentials).pipe(
      tap(result => this.store.startSession(result)),
      tap(() => {
        void this.router.navigateByUrl(returnUrl);
      }),
    );
  }

  logout(redirectUrl = '/admin/login'): Observable<void> {
    const finalizeLogout = () => {
      this.store.clear();
      void this.router.navigateByUrl(redirectUrl);
    };

    if (!this.store.hasSession()) {
      finalizeLogout();
      return of(void 0);
    }

    return this.api.logout().pipe(
      map(() => void 0),
      catchError(() => of(void 0)),
      tap(() => finalizeLogout()),
    );
  }

  refreshCurrentUser(): Observable<boolean> {
    if (!this.isAuthenticated) {
      this.store.clear();
      return of(false);
    }

    return this.api.getCurrent().pipe(
      tap(user => this.store.updateUser(user)),
      map(() => true),
      catchError(() => {
        this.store.clear();
        return of(false);
      }),
    );
  }
}
