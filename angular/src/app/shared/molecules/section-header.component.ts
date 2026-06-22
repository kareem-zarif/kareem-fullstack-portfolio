import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-section-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="section-header">
      <div>
        <p class="section-header__eyebrow">{{ eyebrow() }}</p>
        <h2>{{ title() }}</h2>
        @if (description()) {
          <p class="section-header__description">{{ description() }}</p>
        }
      </div>
      <ng-content />
    </div>
  `,
  styles: [
    `
      .section-header {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: end;
      }

      .section-header__eyebrow {
        margin: 0 0 0.5rem;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #6b7a90;
      }

      h2 {
        margin: 0;
        color: #132238;
        font-size: clamp(1.5rem, 3vw, 2.3rem);
      }

      .section-header__description {
        margin: 0.6rem 0 0;
        max-width: 48rem;
        color: #5f7088;
        line-height: 1.65;
      }
    `,
  ],
})
export class SectionHeaderComponent {
  readonly eyebrow = input('Section');
  readonly title = input.required<string>();
  readonly description = input('');
}
