import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-pulsing-dot',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="dot" aria-hidden="true"></span>`,
  styles: [`
    .dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--teal, #00a389);
      position: relative;
      flex-shrink: 0;
    }

    .dot::after {
      content: "";
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      border: 1px solid var(--teal, #00a389);
      opacity: .5;
    }

    @media (prefers-reduced-motion: no-preference) {
      .dot {
        animation: kz-pulse 2.4s cubic-bezier(.2, .7, .3, 1) infinite;
      }
    }
  `],
})
export class PulsingDotComponent {}
