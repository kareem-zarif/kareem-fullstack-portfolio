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
      <div class="public-layout__glow public-layout__glow--primary"></div>
      <div class="public-layout__glow public-layout__glow--accent"></div>
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
        position: relative;
        isolation: isolate;
        overflow: clip;
        min-height: 100vh;
        --portfolio-bg: #f3f5f9;
        --portfolio-bg-elevated: rgba(255, 255, 255, 0.76);
        --portfolio-bg-soft: rgba(236, 241, 248, 0.82);
        --portfolio-text: #102033;
        --portfolio-muted: #61748d;
        --portfolio-border: rgba(17, 50, 80, 0.1);
        --portfolio-primary: #0f4c81;
        --portfolio-primary-contrast: #ffffff;
        --portfolio-accent: #ff8d57;
        --portfolio-shadow: 0 24px 80px -42px rgba(15, 36, 59, 0.24);
        background:
          radial-gradient(circle at top right, rgba(255, 141, 87, 0.18), transparent 24%),
          radial-gradient(circle at left 20%, rgba(15, 76, 129, 0.14), transparent 28%),
          linear-gradient(180deg, #f8fafc 0%, var(--portfolio-bg) 45%, #eef2f7 100%);
        color: var(--portfolio-text);
        transition:
          background 220ms ease,
          color 220ms ease;
      }

      .public-layout[data-theme='dark'] {
        --portfolio-bg: #07131f;
        --portfolio-bg-elevated: rgba(10, 22, 35, 0.76);
        --portfolio-bg-soft: rgba(16, 31, 47, 0.82);
        --portfolio-text: #ecf4ff;
        --portfolio-muted: #9fb4cb;
        --portfolio-border: rgba(193, 213, 236, 0.14);
        --portfolio-primary: #8ecaf7;
        --portfolio-primary-contrast: #07131f;
        --portfolio-accent: #ffb27a;
        --portfolio-shadow: 0 28px 90px -46px rgba(0, 0, 0, 0.68);
        background:
          radial-gradient(circle at top right, rgba(255, 178, 122, 0.16), transparent 24%),
          radial-gradient(circle at left 20%, rgba(110, 180, 255, 0.18), transparent 30%),
          linear-gradient(180deg, #07131f 0%, #081726 42%, #0d1f31 100%);
      }

      .public-layout__glow {
        position: absolute;
        inset: auto;
        width: min(24rem, 38vw);
        aspect-ratio: 1;
        border-radius: 999px;
        filter: blur(60px);
        opacity: 0.5;
        pointer-events: none;
        z-index: -1;
      }

      .public-layout__glow--primary {
        inset-inline-start: -5rem;
        top: 8rem;
        background: color-mix(in srgb, var(--portfolio-primary) 42%, transparent);
      }

      .public-layout__glow--accent {
        inset-inline-end: -4rem;
        top: 22rem;
        background: color-mix(in srgb, var(--portfolio-accent) 38%, transparent);
      }

      .public-layout__main {
        margin-inline: auto;
        width: min(100%, 1440px);
        padding: 0 clamp(1rem, 4vw, 2.75rem) clamp(2rem, 4vw, 3rem);
      }
    `,
  ],
})
export class PublicLayoutComponent {
  readonly theme = inject(PublicThemeService);
}
