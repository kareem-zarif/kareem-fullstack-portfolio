import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicNavbarComponent } from '@shared/public/public-navbar.component';
import { PublicFooterComponent } from '@shared/public/public-footer.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, PublicNavbarComponent, PublicFooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="public-layout">
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
        background:
          radial-gradient(circle at top left, rgba(56, 126, 177, 0.16), transparent 28%),
          linear-gradient(180deg, #f7fbff 0%, #eef4f9 100%);
      }

      .public-layout__main {
        padding: clamp(1rem, 4vw, 2.5rem);
      }
    `,
  ],
})
export class PublicLayoutComponent {}
