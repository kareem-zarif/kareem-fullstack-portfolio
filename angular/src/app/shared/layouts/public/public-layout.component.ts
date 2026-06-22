import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicThemeService } from '@core/services/public-theme.service';
import { PublicNavbarComponent } from '@shared/public/public-navbar.component';
import { PublicFooterComponent } from '@shared/public/public-footer.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, PublicNavbarComponent, PublicFooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="public-layout"
      [attr.data-theme]="theme.theme()"
      [attr.dir]="theme.direction()"
      [attr.lang]="theme.language()"
    >
      <app-public-navbar />
      <main class="public-layout__main">
        <router-outlet />
      </main>
      <app-public-footer />
    </div>
  `,
  styles: [
    `
      .public-layout {
        min-height: 100vh;
        --portfolio-bg: #f6f9fc;
        --portfolio-bg-elevated: rgba(255, 255, 255, 0.9);
        --portfolio-bg-soft: #eef5fb;
        --portfolio-text: #102033;
        --portfolio-muted: #5c6d82;
        --portfolio-border: rgba(17, 50, 80, 0.12);
        --portfolio-primary: #123b5c;
        --portfolio-primary-contrast: #ffffff;
        --portfolio-accent: #2b83b6;
        --portfolio-shadow: 0 28px 70px -48px rgba(15, 46, 74, 0.55);
        background:
          radial-gradient(circle at top left, color-mix(in srgb, var(--portfolio-accent) 20%, transparent), transparent 30%),
          linear-gradient(180deg, var(--portfolio-bg) 0%, var(--portfolio-bg-soft) 100%);
        color: var(--portfolio-text);
        transition:
          background 220ms ease,
          color 220ms ease;
      }

      .public-layout[data-theme='dark'] {
        --portfolio-bg: #07111d;
        --portfolio-bg-elevated: rgba(12, 24, 38, 0.9);
        --portfolio-bg-soft: #0f1f31;
        --portfolio-text: #eef6ff;
        --portfolio-muted: #a6b7c9;
        --portfolio-border: rgba(195, 220, 245, 0.16);
        --portfolio-primary: #8bd3ff;
        --portfolio-primary-contrast: #07111d;
        --portfolio-accent: #42a5d8;
        --portfolio-shadow: 0 28px 70px -42px rgba(0, 0, 0, 0.72);
      }

      .public-layout__main {
        margin-inline: auto;
        width: min(100%, 1440px);
        padding: clamp(1rem, 4vw, 2.5rem);
      }
    `,
  ],
})
export class PublicLayoutComponent {
  readonly theme = inject(PublicThemeService);
}
