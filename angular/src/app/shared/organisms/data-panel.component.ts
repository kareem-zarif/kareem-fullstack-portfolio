import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-data-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="panel">
      <header class="panel__header">
        <div>
          <h3>{{ title() }}</h3>
          @if (subtitle()) {
            <p>{{ subtitle() }}</p>
          }
        </div>
        <ng-content select="[panel-actions]" />
      </header>
      <div class="panel__body">
        <ng-content />
      </div>
    </section>
  `,
  styles: [
    `
      .panel {
        border: 1px solid #d7e1ec;
        border-radius: 1.25rem;
        background: #ffffff;
        box-shadow: 0 24px 48px -36px rgba(12, 32, 61, 0.4);
      }

      .panel__header {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: center;
        padding: 1.25rem 1.25rem 1rem;
        border-bottom: 1px solid #ebf0f5;
      }

      .panel__header h3 {
        margin: 0;
        color: #132238;
      }

      .panel__header p {
        margin: 0.35rem 0 0;
        color: #617188;
      }

      .panel__body {
        padding: 1.25rem;
      }
    `,
  ],
})
export class DataPanelComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
}
