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
  styles: [],
})
export class PublicLayoutComponent {
  readonly theme = inject(PublicThemeService);
}
