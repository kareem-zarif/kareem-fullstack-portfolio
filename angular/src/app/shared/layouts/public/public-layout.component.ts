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
      <!-- Decorative animated grid/glow background -->
      <div class="bg-fx" aria-hidden="true"></div>

      <app-public-navbar />

      <main class="public-layout__main">
        <router-outlet />
      </main>

      <app-public-footer />
    </div>
  `,
  styles: [`
    .public-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
      background: var(--bg, #141414);
      color: var(--text, #f4f5f0);
      font-family: var(--font-en, 'IBM Plex Sans', system-ui, sans-serif);
      transition:
        background var(--dur, 240ms) var(--ease, cubic-bezier(.2,.7,.3,1)),
        color var(--dur, 240ms) var(--ease, cubic-bezier(.2,.7,.3,1));
    }

    :host-context([lang="ar"]) .public-layout {
      font-family: var(--font-ar, 'IBM Plex Sans Arabic', 'IBM Plex Sans', system-ui, sans-serif);
    }

    .public-layout__main {
      flex: 1;
      position: relative;
      z-index: 1;
    }
  `],
})
export class PublicLayoutComponent {
  readonly theme = inject(PublicThemeService);
}
