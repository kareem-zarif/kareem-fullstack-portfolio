import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-logo-mark',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="logo-mark" [class]="sizeClass()">
      <span class="p1"></span>
      <span class="p2"></span>
    </span>
  `,
  styles: [`
    .logo-mark {
      position: relative;
      display: inline-block;
      width: 40px;
      height: 32px;
      flex-shrink: 0;
    }

    .logo-mark.sm {
      width: 26px;
      height: 22px;
    }

    .p1, .p2 {
      position: absolute;
      transform: skewX(-38deg);
    }

    .logo-mark:not(.sm) .p1,
    .logo-mark:not(.sm) .p2 {
      width: 19px;
      height: 20px;
    }

    .logo-mark.sm .p1,
    .logo-mark.sm .p2 {
      width: 13px;
      height: 14px;
    }

    .p1 {
      top: 2px;
      inset-inline-start: 2px;
      background: var(--lime-bright, #b2e742);
      outline: 2.5px solid var(--surface, #1e1e1e);
      z-index: 2;
    }

    .logo-mark.sm .p1 {
      top: 1px;
      inset-inline-start: 1px;
      outline-width: 2px;
    }

    .p2 {
      background: #8c8c8c;
      z-index: 1;
    }

    .logo-mark:not(.sm) .p2 {
      top: 10px;
      inset-inline-start: 11px;
    }

    .logo-mark.sm .p2 {
      top: 6px;
      inset-inline-start: 7px;
    }
  `],
})
export class LogoMarkComponent {
  readonly size = input<'sm' | 'md'>('md');
  readonly sizeClass = () => this.size() === 'sm' ? 'sm' : '';
}
