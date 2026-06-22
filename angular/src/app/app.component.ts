import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderBarComponent } from '@abp/ng.theme.shared';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <abp-loader-bar />
    <router-outlet />
  `,
  imports: [LoaderBarComponent, RouterOutlet],
})
export class AppComponent {}
