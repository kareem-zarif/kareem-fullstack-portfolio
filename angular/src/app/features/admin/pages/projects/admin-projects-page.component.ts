import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { PortfolioProjectsService } from '@features/portfolio/services/portfolio-projects.service';
import { DataPanelComponent } from '@shared/organisms/data-panel.component';
import { ChipComponent } from '@shared/atoms/chip.component';
import { trackBySlug } from '@core/utils/track-by.util';
import { Project } from '@shared/models';

@Component({
  selector: 'app-admin-projects-page',
  standalone: true,
  imports: [CommonModule, DataPanelComponent, ChipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-data-panel
      title="Projects management"
      subtitle="A placeholder management table with enterprise-friendly widths, truncation, and stronger searchable columns."
    >
      <input
        panel-actions
        type="search"
        class="search"
        placeholder="Search title or category"
        [value]="search()"
        (input)="search.set($any($event.target).value)"
      />

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th class="cell--strong">Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            @for (project of filteredProjects(); track trackBySlug($index, project)) {
              <tr>
                <td class="cell cell--strong cell--truncate">{{ project.title }}</td>
                <td class="cell cell--truncate">{{ project.category }}</td>
                <td class="cell">
                  <app-chip [label]="project.status" [tone]="project.status === 'Live' ? 'success' : project.status === 'InProgress' ? 'warning' : 'neutral'" />
                </td>
                <td class="cell">{{ project.updatedAt | date: 'mediumDate' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </app-data-panel>
  `,
  styles: [
    `
      .search {
        width: min(22rem, 100%);
        border-radius: 999px;
        border: 1px solid #cfdae6;
        padding: 0.85rem 1rem;
        background: #f9fbfd;
      }

      .table-wrap {
        overflow-x: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        text-align: left;
        padding: 0.9rem 0.75rem;
        border-bottom: 1px solid #ebf0f5;
      }

      th {
        color: #6d7d94;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .cell {
        color: #5f7088;
      }

      .cell--strong {
        color: #132238;
        font-weight: 700;
        max-width: 18rem;
      }

      .cell--truncate {
        max-width: 14rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `,
  ],
})
export class AdminProjectsPageComponent {
  readonly trackBySlug = trackBySlug;
  readonly search = signal('');
  readonly projects = toSignal(inject(PortfolioProjectsService).getProjects(), {
    initialValue: [] as Project[],
  });
  readonly filteredProjects = computed(() => {
    const term = this.search().trim().toLowerCase();
    return term
      ? this.projects().filter(project => `${project.title} ${project.category}`.toLowerCase().includes(term))
      : this.projects();
  });
}
