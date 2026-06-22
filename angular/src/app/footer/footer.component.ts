import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PORTFOLIO_APP_NAME } from '@core/tokens/portfolio-app-name.token';

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="lpx-footbar-container end-0">
      <div class="lpx-footbar">
        <div class="lpx-footbar-copyright">
          <span>{{ currentYear }} © {{ appName }}</span>
        </div>
        <div class="lpx-footbar-solo-links">
          <a href="/">Portfolio</a>
          <a href="/contact">Contact</a>
          <a href="/admin/dashboard">Admin</a>
        </div>
      </div>
    </div>
  `,
})
export class FooterComponent {
  readonly appName = inject(PORTFOLIO_APP_NAME);
  currentYear = new Date().getFullYear();
}
