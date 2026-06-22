import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

export type PublicTheme = 'light' | 'dark';
export type PublicDirection = 'ltr' | 'rtl';
export type PortfolioLanguage = 'en' | 'ar';

@Injectable({ providedIn: 'root' })
export class PublicThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly themeStorageKey = 'portfolio-public-theme';
  private readonly languageStorageKey = 'portfolio-public-language';

  readonly theme = signal<PublicTheme>(this.getInitialTheme());
  readonly language = signal<PortfolioLanguage>(this.getInitialLanguage());
  readonly direction = computed<PublicDirection>(() => (this.language() === 'ar' ? 'rtl' : 'ltr'));
  readonly isDark = computed(() => this.theme() === 'dark');
  readonly isArabic = computed(() => this.language() === 'ar');

  constructor() {
    effect(() => {
      const theme = this.theme();
      const language = this.language();
      const direction = this.direction();
      const root = this.document.documentElement;

      root.dataset['publicTheme'] = theme;
      root.lang = language;
      root.dir = direction;
      root.style.colorScheme = theme;

      this.persistTheme(theme);
      this.persistLanguage(language);
    });
  }

  toggleTheme(): void {
    this.theme.update(theme => (theme === 'dark' ? 'light' : 'dark'));
  }

  toggleLanguage(): void {
    this.language.update(language => (language === 'en' ? 'ar' : 'en'));
  }

  setLanguage(language: PortfolioLanguage): void {
    this.language.set(language);
  }

  private getInitialTheme(): PublicTheme {
    const storedTheme = this.readStoredTheme();

    if (storedTheme) {
      return storedTheme;
    }

    return globalThis.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
  }

  private getInitialLanguage(): PortfolioLanguage {
    const storedLanguage = this.readStoredLanguage();
    if (storedLanguage) {
      return storedLanguage;
    }

    const htmlLanguage = this.document.documentElement.lang?.toLowerCase();
    if (htmlLanguage.startsWith('ar')) {
      return 'ar';
    }

    return 'en';
  }

  private readStoredTheme(): PublicTheme | null {
    try {
      const value = globalThis.localStorage?.getItem(this.themeStorageKey);
      return value === 'dark' || value === 'light' ? value : null;
    } catch {
      return null;
    }
  }

  private readStoredLanguage(): PortfolioLanguage | null {
    try {
      const value = globalThis.localStorage?.getItem(this.languageStorageKey);
      return value === 'ar' || value === 'en' ? value : null;
    } catch {
      return null;
    }
  }

  private persistTheme(theme: PublicTheme): void {
    try {
      globalThis.localStorage?.setItem(this.themeStorageKey, theme);
    } catch {
      // Theme persistence is optional; rendering should keep working without storage access.
    }
  }

  private persistLanguage(language: PortfolioLanguage): void {
    try {
      globalThis.localStorage?.setItem(this.languageStorageKey, language);
    } catch {
      // Language persistence is optional; rendering should keep working without storage access.
    }
  }
}
