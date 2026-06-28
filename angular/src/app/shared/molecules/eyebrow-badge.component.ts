import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PulsingDotComponent } from '@shared/atoms/pulsing-dot.component';

@Component({
  selector: 'app-eyebrow-badge',
  standalone: true,
  imports: [PulsingDotComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="eyebrow-badge">
      <app-pulsing-dot />
      <span>{{ text() }}</span>
    </span>
  `,
  styles: [`
    .eyebrow-badge {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      height: 34px;
      padding: 0 14px;
      border-radius: var(--r-full, 9999px);
      background: var(--chip-bg, #1f1f1f);
      border: 1px solid var(--chip-border, #333);
      font-size: 12.5px;
      font-weight: 600;
      letter-spacing: .02em;
      color: var(--text-muted, #c7c9c2);
      box-shadow: var(--shadow-sm);
    }
  `],
})
export class EyebrowBadgeComponent {
  readonly text = input.required<string>();
}
