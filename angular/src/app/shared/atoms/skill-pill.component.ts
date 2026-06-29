import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Skill matrix pill — a single skill rendered as either a highlighted
 * "core" skill (lime gradient + star) or a calmer "supporting" skill (dot).
 * Shared atom reused across the Skills Matrix category cards.
 */
@Component({
  selector: 'app-skill-pill',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="skill" [class.skill--core]="core()">
      @if (core()) {
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      } @else {
        <i class="sd" aria-hidden="true"></i>
      }
      {{ label() }}
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }

    .skill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 28px;
      padding: 0 10px;
      border-radius: var(--r-full, 9999px);
      background: var(--chip-bg, #1f1f1f);
      border: 1px solid var(--chip-border, #333333);
      font-size: 11.5px;
      font-weight: 600;
      color: var(--text, #f4f5f0);
      white-space: nowrap;
      box-shadow: var(--shadow-sm);
      transition:
        transform var(--dur-fast, 150ms) var(--ease, cubic-bezier(.2,.7,.3,1)),
        border-color var(--dur-fast, 150ms) var(--ease, cubic-bezier(.2,.7,.3,1)),
        box-shadow var(--dur-fast, 150ms) var(--ease, cubic-bezier(.2,.7,.3,1)),
        filter var(--dur-fast, 150ms) var(--ease, cubic-bezier(.2,.7,.3,1));
    }

    .skill:hover {
      transform: translateY(-2px);
      border-color: var(--accent-line, #b2e742);
    }

    .sd {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--text-faint, #9a9c95);
      flex-shrink: 0;
    }

    /* Core / primary skill — lime gradient, white text, star icon */
    .skill--core {
      background: var(--gradient-brand, linear-gradient(94deg, #85bb23 0%, #6ea30d 100%));
      color: #fff;
      border-color: rgba(255, 255, 255, .16);
      box-shadow: var(--shadow-btn);
      font-weight: 700;
    }

    .skill--core:hover {
      filter: brightness(1.07);
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, .28);
    }

    .skill--core svg {
      width: 11px;
      height: 11px;
      color: #fff;
      flex-shrink: 0;
    }
  `],
})
export class SkillPillComponent {
  readonly label = input.required<string>();
  readonly core = input(false);
}
