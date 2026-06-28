import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type TechChipAccent = 'lime' | 'teal' | 'info';

@Component({
  selector: 'app-tech-chip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="tech-chip" [class]="'accent-' + accent()">
      <i class="dot" aria-hidden="true"></i>
      {{ label() }}
    </span>
  `,
  styles: [`
    .tech-chip {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      height: 34px;
      padding: 0 13px;
      border-radius: var(--r-full, 9999px);
      background: var(--chip-bg, #1f1f1f);
      border: 1px solid var(--chip-border, #333333);
      font-size: 13px;
      font-weight: 600;
      color: var(--text, #f4f5f0);
      box-shadow: var(--shadow-sm);
      white-space: nowrap;
      transition:
        transform var(--dur-fast, 150ms) var(--ease, cubic-bezier(.2,.7,.3,1)),
        border-color var(--dur-fast, 150ms) var(--ease, cubic-bezier(.2,.7,.3,1));
      cursor: default;
    }

    .tech-chip:hover {
      transform: translateY(-2px);
      border-color: var(--accent-line, #b2e742);
    }

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      display: inline-block;
      flex-shrink: 0;
    }

    .accent-lime .dot  { background: var(--accent-line, #b2e742); }
    .accent-teal .dot  { background: var(--teal, #00a389); }
    .accent-info .dot  { background: var(--info, #0b84b5); }
  `],
})
export class TechChipComponent {
  readonly label = input.required<string>();
  readonly accent = input<TechChipAccent>('lime');
}
