import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Toolbar toggle chip used by the projects filter rows (Focus / Tech).
 * Pressed state renders the brand gradient; idle state is a neutral chip.
 * Reused for every filter option in both rows.
 */
@Component({
  selector: 'app-filter-chip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="chip"
      [attr.aria-pressed]="pressed()"
      (click)="select.emit()"
    >
      <span>{{ label() }}</span>
    </button>
  `,
  styles: [`
    :host { display: contents; }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      height: 36px;
      padding: 0 15px;
      border-radius: var(--r-full, 9999px);
      background: var(--chip-bg, #1f1f1f);
      border: 1px solid var(--chip-border, #333);
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted, #c7c9c2);
      white-space: nowrap;
      transition:
        transform var(--dur-fast, 150ms) var(--ease),
        border-color var(--dur-fast, 150ms) var(--ease),
        color var(--dur-fast, 150ms) var(--ease),
        background var(--dur-fast, 150ms) var(--ease),
        box-shadow var(--dur-fast, 150ms) var(--ease),
        filter var(--dur-fast, 150ms) var(--ease);
    }

    .chip:hover {
      transform: translateY(-1px);
      border-color: var(--accent-line, #b2e742);
      color: var(--text, #f4f5f0);
    }

    .chip:active { transform: scale(.97); }

    .chip[aria-pressed="true"] {
      background: var(--gradient-brand, linear-gradient(94deg, #85bb23 0%, #6ea30d 100%));
      color: #fff;
      border-color: rgba(255, 255, 255, .16);
      box-shadow: var(--shadow-btn);
      font-weight: 700;
    }

    .chip[aria-pressed="true"]:hover { filter: brightness(1.06); }
  `],
})
export class FilterChipComponent {
  readonly label = input.required<string>();
  readonly pressed = input(false);
  readonly select = output<void>();
}
