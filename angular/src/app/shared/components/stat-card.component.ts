import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="stat-card">
      <p class="stat-card__label">{{ label() }}</p>
      <strong>{{ value() }}</strong>
      <span>{{ meta() }}</span>
    </article>
  `,
  styles: [
    `
      .stat-card {
        display: grid;
        gap: 0.35rem;
        padding: 1.1rem 1.15rem;
        border-radius: 1rem;
        border: 1px solid #dce4ee;
        background: linear-gradient(180deg, #ffffff 0%, #f6f9fc 100%);
      }

      .stat-card__label,
      span {
        margin: 0;
        color: #6c7c93;
      }

      strong {
        font-size: 1.9rem;
        color: #132238;
      }
    `,
  ],
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly meta = input('');
}
