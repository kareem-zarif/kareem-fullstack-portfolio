import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-icon-btn',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="kz-icon-btn"
      [class.wide]="wide()"
      [attr.aria-label]="ariaLabel()"
      (click)="clicked.emit()"
    >
      <ng-content />
    </button>
  `,
  styles: [`
    :host { display: contents; }

    .kz-icon-btn.wide {
      width: auto;
      padding: 0 14px;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
    }

    .kz-icon-btn :ng-deep svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .kz-icon-btn.wide :ng-deep svg {
      width: 16px;
      height: 16px;
      color: var(--text-faint);
    }
  `],
})
export class IconBtnComponent {
  readonly ariaLabel = input('');
  readonly wide = input(false);
  readonly clicked = output<void>();
}
