import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

export type PublicTheme = 'light' | 'dark';
export type PublicDirection = 'ltr' | 'rtl';

@Injectable({ providedIn: 'root' })
export class PublicThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'portfolio-public-theme';

  readonly theme = signal<PublicTheme>(this.getInitialTheme());
  readonly language = signal(this.getInitialLanguage());
  readonly direction = computed<PublicDirection>(() =>
    this.document.documentElement.dir === 'rtl' || this.language().toLowerCase().startsWith('ar')
      ? 'rtl'
      : 'ltr',
  );

  constructor() {
    effect(() => {
      const theme = this.theme();
      this.document.documentElement.dataset['publicTheme'] = theme;
      this.persistTheme(theme);
    });
  }

  toggleTheme(): void {
    this.theme.update(theme => (theme === 'dark' ? 'light' : 'dark'));
  }

  private getInitialTheme(): PublicTheme {
    const storedTheme = this.readStoredTheme();

    if (storedTheme) {
      return storedTheme;
    }

    return globalThis.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
  }

  private getInitialLanguage(): string {
    return this.document.documentElement.lang || globalThis.navigator?.language || 'en';
  }

  private readStoredTheme(): PublicTheme | null {
    try {
      const value = globalThis.localStorage?.getItem(this.storageKey);
      return value === 'dark' || value === 'light' ? value : null;
    } catch {
      return null;
    }
  }

  private persistTheme(theme: PublicTheme): void {
    try {
      globalThis.localStorage?.setItem(this.storageKey, theme);
    } catch {
      // Theme persistence is optional; rendering should keep working without storage access.
    }
  }
}
