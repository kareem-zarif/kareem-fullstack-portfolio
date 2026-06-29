import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

export type TagVariant = 'neutral' | 'teal' | 'info' | 'indigo' | 'feat';

@Component({
  selector: 'app-tag-badge',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="tag" [ngClass]="'tag--' + variant()">
      <ng-content />
    </span>
  `,
  styles: [`
    .tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 24px;
      padding: 0 10px;
      border-radius: var(--r-full, 9999px);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .04em;
      white-space: nowrap;
      background: var(--surface-2, #1a1a1a);
      border: 1px solid var(--border, #2e2e2e);
      color: var(--text-muted, #c7c9c2);
    }

    :host ::ng-deep svg {
      width: 13px;
      height: 13px;
      flex-shrink: 0;
    }

    /* teal — Upskilling */
    .tag--teal {
      background: rgba(0, 163, 137, .12);
      border-color: transparent;
      color: var(--teal, #00a389);
    }

    /* info — Analytical */
    .tag--info {
      background: rgba(11, 132, 181, .12);
      border-color: transparent;
      color: var(--info, #0b84b5);
    }

    /* indigo — Foundation */
    .tag--indigo {
      background: rgba(67, 56, 202, .14);
      border-color: transparent;
      color: var(--indigo, #4338ca);
    }

    :host-context([data-theme="dark"]) .tag--indigo {
      color: #a5b4fc;
    }

    /* feat — Primary Experience (lime gradient) */
    .tag--feat {
      background: var(--gradient-brand, linear-gradient(94deg, #85bb23 0%, #6ea30d 100%));
      border-color: rgba(255, 255, 255, .2);
      color: #fff;
      box-shadow: var(--shadow-sm);
    }
  `],
})
export class TagBadgeComponent {
  readonly variant = input<TagVariant>('neutral');
}
