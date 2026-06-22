import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicThemeService } from '@core/services/public-theme.service';
import { AdminSidebarComponent } from '@shared/admin/admin-sidebar.component';
import { AdminTopbarComponent } from '@shared/admin/admin-topbar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminSidebarComponent, AdminTopbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="admin-layout"
      [attr.data-theme]="theme.theme()"
      [attr.dir]="theme.direction()"
      [attr.lang]="theme.language()"
    >
      <div class="admin-layout__glow admin-layout__glow--primary"></div>
      <div class="admin-layout__glow admin-layout__glow--accent"></div>
      <app-admin-sidebar />
      <div class="admin-layout__content">
        <app-admin-topbar />
        <main class="admin-layout__main">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-layout {
        min-height: 100vh;
        position: relative;
        isolation: isolate;
        overflow: clip;
        display: grid;
        grid-template-columns: minmax(260px, 300px) minmax(0, 1fr);
        gap: 1.2rem;
        padding: 1.2rem;
        --admin-bg: #f4f7fb;
        --admin-panel: rgba(255, 255, 255, 0.78);
        --admin-panel-soft: rgba(235, 241, 248, 0.88);
        --admin-text: #12243a;
        --admin-muted: #667a93;
        --admin-border: rgba(18, 36, 58, 0.12);
        --admin-primary: #103c65;
        --admin-primary-contrast: #ffffff;
        --admin-accent: #ff935a;
        --admin-shadow: 0 24px 70px -40px rgba(12, 34, 56, 0.2);
        background:
          radial-gradient(circle at top left, rgba(16, 60, 101, 0.16), transparent 24%),
          radial-gradient(circle at right 20%, rgba(255, 147, 90, 0.18), transparent 24%),
          linear-gradient(180deg, #f7f9fc 0%, var(--admin-bg) 100%);
      }

      .admin-layout[data-theme='dark'] {
        --admin-bg: #07131f;
        --admin-panel: rgba(10, 20, 33, 0.8);
        --admin-panel-soft: rgba(14, 27, 42, 0.88);
        --admin-text: #ecf4ff;
        --admin-muted: #99adc6;
        --admin-border: rgba(191, 214, 235, 0.14);
        --admin-primary: #8ecaf7;
        --admin-primary-contrast: #07131f;
        --admin-accent: #ffbe8d;
        --admin-shadow: 0 28px 90px -48px rgba(0, 0, 0, 0.68);
        background:
          radial-gradient(circle at top left, rgba(142, 202, 247, 0.18), transparent 24%),
          radial-gradient(circle at right 20%, rgba(255, 190, 141, 0.16), transparent 24%),
          linear-gradient(180deg, #07131f 0%, #081726 100%);
      }

      .admin-layout__glow {
        position: absolute;
        width: min(22rem, 34vw);
        aspect-ratio: 1;
        border-radius: 999px;
        filter: blur(60px);
        opacity: 0.42;
        pointer-events: none;
        z-index: -1;
      }

      .admin-layout__glow--primary {
        inset-inline-start: -4rem;
        top: 5rem;
        background: color-mix(in srgb, var(--admin-primary) 40%, transparent);
      }

      .admin-layout__glow--accent {
        inset-inline-end: -5rem;
        bottom: 4rem;
        background: color-mix(in srgb, var(--admin-accent) 38%, transparent);
      }

      .admin-layout__content {
        min-width: 0;
        display: grid;
        gap: 1rem;
      }

      .admin-layout__main {
        padding: 0 0 1rem;
      }

      @media (max-width: 960px) {
        .admin-layout {
          grid-template-columns: 1fr;
          padding: 0.9rem;
        }
      }
    `,
  ],
})
export class AdminLayoutComponent {
  readonly theme = inject(PublicThemeService);
}
