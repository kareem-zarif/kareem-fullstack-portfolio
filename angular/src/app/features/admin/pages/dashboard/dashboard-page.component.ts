import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { AdminDashboardFacade } from '@features/admin/services/admin-dashboard.facade';
import { AdminDashboardMetric } from '@features/admin/models';
import { StatCardComponent } from '@shared/components/stat-card.component';
import { DataPanelComponent } from '@shared/organisms/data-panel.component';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule, StatCardComponent, DataPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="dashboard">
      <div class="dashboard__stats">
        @for (metric of metrics(); track metric.label) {
          <app-stat-card [label]="metric.label" [value]="metric.value" [meta]="metric.context" />
        }
      </div>

      <app-data-panel
        title="Architecture checkpoint"
        subtitle="This admin area already uses lazy routing, guards, typed service contracts, and reusable layout primitives."
      >
        <div class="dashboard__notes">
          <article>
            <strong>Public shell</strong>
            <p>Separate layout with navbar, footer, and route-focused content area.</p>
          </article>
          <article>
            <strong>Admin shell</strong>
            <p>Dedicated sidebar and topbar prepared for future ABP-backed management screens.</p>
          </article>
          <article>
            <strong>Frontend contracts</strong>
            <p>Projects, skills, experience, messages, and settings are typed and service-driven.</p>
          </article>
        </div>
      </app-data-panel>
    </section>
  `,
  styles: [
    `
      .dashboard,
      .dashboard__stats,
      .dashboard__notes {
        display: grid;
        gap: 1rem;
      }

      .dashboard__stats {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .dashboard__notes {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      article {
        display: grid;
        gap: 0.45rem;
        padding: 1rem;
        border-radius: 1rem;
        background: #f5f9fc;
      }

      strong {
        color: #132238;
      }

      p {
        margin: 0;
        color: #5f7088;
        line-height: 1.65;
      }

      @media (max-width: 1100px) {
        .dashboard__stats,
        .dashboard__notes {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 720px) {
        .dashboard__stats,
        .dashboard__notes {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AdminDashboardPageComponent {
  readonly metrics = toSignal(inject(AdminDashboardFacade).getOverviewMetrics(), {
    initialValue: [] as AdminDashboardMetric[],
  });
}
