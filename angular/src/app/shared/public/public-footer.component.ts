import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AppShellService } from '@core/services/app-shell.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div></div>`,
  styles: [],
})
export class PublicFooterComponent {
  readonly shell = inject(AppShellService);
  private readonly footer = toSignal(this.shell.publicFooterLinks$.pipe(catchError(() => of([]))), { initialValue: [] });

  readonly footerLinks = this.footer;

  resolveHref(link: Parameters<AppShellService['resolveFooterHref']>[0]): string | null {
    return this.shell.resolveFooterHref(link);
  }

  linkIcon(type: number): string {
    switch (type) {
      case 1: return 'bi bi-github';
      case 2: return 'bi bi-linkedin';
      case 3: return 'bi bi-envelope';
      case 4: return 'bi bi-file-earmark-arrow-down';
      default: return 'bi bi-link-45deg';
    }
  }
}
