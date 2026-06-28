import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

export type ChipTone = 'neutral' | 'success' | 'warning' | 'accent' | 'info';

@Component({
  selector: 'app-chip',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="chip" [ngClass]="'chip--' + tone()">{{ label() }}</span>`,
  styles: [`
    .chip {
      display: inline-flex;
      align-items: center;
      border-radius: var(--r-full, 9999px);
      padding: .35rem .75rem;
      font-size: .78rem;
      font-weight: 600;
      letter-spacing: .02em;
      white-space: nowrap;
    }

    /* Neutral — adapts to theme */
    .chip--neutral {
      background: var(--chip-bg, #1f1f1f);
      color: var(--text-muted, #c7c9c2);
      border: 1px solid var(--chip-border, #333);
    }

    /* Success (teal) */
    .chip--success {
      background: rgba(0, 163, 137, .14);
      color: var(--teal, #00a389);
    }

    /* Warning (amber) */
    .chip--warning {
      background: rgba(255, 132, 0, .14);
      color: var(--amber, #ff8400);
    }

    /* Accent (lime) */
    .chip--accent {
      background: rgba(178, 231, 66, .12);
      color: var(--accent-text, #b2e742);
    }

    /* Info (blue) */
    .chip--info {
      background: rgba(11, 132, 181, .14);
      color: var(--info, #0b84b5);
    }

    /* Light-theme overrides for neutral */
    :host-context([data-theme="light"]) .chip--neutral {
      background: #f5f5f5;
      color: #21405c;
      border-color: #e5e7eb;
    }

    :host-context([data-theme="light"]) .chip--success {
      background: #e2f5ea;
      color: #0d6b3a;
    }

    :host-context([data-theme="light"]) .chip--warning {
      background: #fff0d9;
      color: #935c00;
    }
  `],
})
export class ChipComponent {
  readonly label = input.required<string>();
  readonly tone = input<ChipTone>('neutral');
}
