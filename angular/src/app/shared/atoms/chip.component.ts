import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-chip',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="chip" [ngClass]="'chip--' + tone()">{{ label() }}</span>`,
  styles: [
    `
      .chip {
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        padding: 0.35rem 0.75rem;
        font-size: 0.78rem;
        font-weight: 600;
        letter-spacing: 0.02em;
      }

      .chip--neutral {
        background: #e7ecf3;
        color: #21405c;
      }

      .chip--success {
        background: #e2f5ea;
        color: #0d6b3a;
      }

      .chip--warning {
        background: #fff0d9;
        color: #935c00;
      }
    `,
  ],
})
export class ChipComponent {
  readonly label = input.required<string>();
  readonly tone = input<'neutral' | 'success' | 'warning'>('neutral');
}
