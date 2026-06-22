import { Injectable, signal } from '@angular/core';
import {
  AdminCurrentUserModel,
  AdminLoginResultModel,
  StoredAdminSessionModel,
} from '@core/auth/admin-auth.models';

@Injectable({ providedIn: 'root' })
export class AdminSessionStore {
  private readonly storageKey = 'portfolio-admin-session';
  private readonly sessionState = signal<StoredAdminSessionModel | null>(this.readStoredSession());

  get isAuthenticated(): boolean {
    return this.getActiveSession() !== null;
  }

  get currentUser(): AdminCurrentUserModel | null {
    return this.getActiveSession()?.user ?? null;
  }

  get accessToken(): string | null {
    return this.getActiveSession()?.accessToken ?? null;
  }

  hasSession(): boolean {
    return this.sessionState() !== null;
  }

  startSession(result: AdminLoginResultModel): void {
    const session: StoredAdminSessionModel = {
      accessToken: result.accessToken,
      tokenType: result.tokenType,
      expiresAtUtc: result.expiresAtUtc,
      user: result.user,
    };

    this.sessionState.set(session);
    this.persist(session);
  }

  updateUser(user: AdminCurrentUserModel): void {
    const session = this.getActiveSession();
    if (!session) {
      return;
    }

    const nextSession = {
      ...session,
      user,
    };

    this.sessionState.set(nextSession);
    this.persist(nextSession);
  }

  clear(): void {
    this.sessionState.set(null);

    try {
      globalThis.localStorage?.removeItem(this.storageKey);
    } catch {
      // Storage access is optional; clearing memory state is enough for logout to work.
    }
  }

  private getActiveSession(): StoredAdminSessionModel | null {
    const session = this.sessionState();
    if (!session) {
      return null;
    }

    const expiresAtMs = Date.parse(session.expiresAtUtc);
    if (Number.isNaN(expiresAtMs) || expiresAtMs <= Date.now()) {
      this.clear();
      return null;
    }

    return session;
  }

  private readStoredSession(): StoredAdminSessionModel | null {
    try {
      const rawValue = globalThis.localStorage?.getItem(this.storageKey);
      if (!rawValue) {
        return null;
      }

      const parsed = JSON.parse(rawValue) as Partial<StoredAdminSessionModel> | null;
      if (
        !parsed ||
        typeof parsed.accessToken !== 'string' ||
        typeof parsed.tokenType !== 'string' ||
        typeof parsed.expiresAtUtc !== 'string' ||
        !parsed.user ||
        typeof parsed.user.userName !== 'string' ||
        !Array.isArray(parsed.user.grantedPermissions)
      ) {
        return null;
      }

      return {
        accessToken: parsed.accessToken,
        tokenType: parsed.tokenType,
        expiresAtUtc: parsed.expiresAtUtc,
        user: {
          id: typeof parsed.user.id === 'string' ? parsed.user.id : '',
          userName: parsed.user.userName,
          email: typeof parsed.user.email === 'string' ? parsed.user.email : null,
          grantedPermissions: parsed.user.grantedPermissions.filter(
            (permission): permission is string => typeof permission === 'string',
          ),
        },
      };
    } catch {
      return null;
    }
  }

  private persist(session: StoredAdminSessionModel): void {
    try {
      globalThis.localStorage?.setItem(this.storageKey, JSON.stringify(session));
    } catch {
      // Session persistence is optional; in-memory auth still works for the current tab.
    }
  }
}
