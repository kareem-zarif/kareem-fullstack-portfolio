import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublicThemeService } from '@core/services/public-theme.service';

const NOT_FOUND_COPY = {
  en: {
    code: '404',
    title: 'Page not found',
    body: 'The route you requested is not part of the current portfolio workspace.',
    goHome: 'Go home',
    admin: 'Admin login',
  },
  ar: {
    code: '404',
    title: 'الصفحة غير موجودة',
    body: 'المسار المطلوب غير متاح داخل البورتفوليو الحالي.',
    goHome: 'العودة للرئيسية',
    admin: 'تسجيل دخول الإدارة',
  },
} as const;

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="not-found"
      [attr.data-theme]="theme.theme()"
      [attr.dir]="theme.direction()"
      [attr.lang]="theme.language()"
    >
      <p>{{ copy().code }}</p>
      <h1>{{ copy().title }}</h1>
      <span>{{ copy().body }}</span>
      <div class="not-found__actions">
        <a routerLink="/">{{ copy().goHome }}</a>
        <a routerLink="/admin/login">{{ copy().admin }}</a>
      </div>
    </section>
  `,
  styles: [
    `
      .not-found {
        min-height: 100vh;
        display: grid;
        place-content: center;
        gap: 0.85rem;
        padding: 2rem;
        text-align: center;
        --not-found-bg: #f6f8fc;
        --not-found-panel: rgba(255, 255, 255, 0.82);
        --not-found-text: #132238;
        --not-found-muted: #5d6f86;
        --not-found-accent: #103c65;
        --not-found-border: rgba(19, 34, 56, 0.12);
        background:
          radial-gradient(circle at top left, rgba(16, 60, 101, 0.16), transparent 24%),
          radial-gradient(circle at right 20%, rgba(255, 147, 90, 0.18), transparent 24%),
          linear-gradient(180deg, #f7fbff 0%, var(--not-found-bg) 100%);
        color: var(--not-found-text);
      }

      .not-found[data-theme='dark'] {
        --not-found-bg: #081523;
        --not-found-panel: rgba(10, 19, 30, 0.84);
        --not-found-text: #ecf4ff;
        --not-found-muted: #9cb2cb;
        --not-found-accent: #8ecaf7;
        --not-found-border: rgba(191, 214, 235, 0.14);
      }

      p,
      h1,
      span {
        margin: 0;
      }

      p {
        font-size: 0.85rem;
        letter-spacing: 0.16em;
        color: var(--not-found-muted);
      }

      h1 {
        color: var(--not-found-text);
      }

      span {
        color: var(--not-found-muted);
      }

      .not-found__actions {
        display: flex;
        gap: 0.85rem;
        justify-content: center;
        flex-wrap: wrap;
      }

      a {
        border-radius: 999px;
        padding: 0.85rem 1rem;
        text-decoration: none;
        border: 1px solid var(--not-found-border);
        background: color-mix(in srgb, var(--not-found-panel) 92%, transparent);
        color: var(--not-found-accent);
        font-weight: 600;
      }
    `,
  ],
})
export class NotFoundPageComponent {
  readonly theme = inject(PublicThemeService);
  readonly copy = computed(() => NOT_FOUND_COPY[this.theme.language()]);
}
