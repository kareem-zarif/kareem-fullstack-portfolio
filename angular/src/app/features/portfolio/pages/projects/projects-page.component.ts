import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PortfolioProjectsService } from '@features/portfolio/services/portfolio-projects.service';
import { SectionHeaderComponent } from '@shared/molecules/section-header.component';
import { ChipComponent } from '@shared/atoms/chip.component';
import { trackBySlug } from '@core/utils/track-by.util';
import { Project } from '@shared/models';

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SectionHeaderComponent, ChipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="surface">
      <app-section-header
        eyebrow="Projects"
        title="A scalable list ready for real API data"
        description="The page is already using typed models and a filterable view model, so moving from static placeholders to ABP endpoints later will be a service change rather than a page rewrite."
      />

      <div class="toolbar">
        <input
          type="search"
          placeholder="Search by title, category, or stack"
          [value]="search()"
          (input)="search.set($any($event.target).value)"
        />
        <span>{{ filteredProjects().length }} project(s)</span>
      </div>

      <div class="grid">
        @for (project of filteredProjects(); track trackBySlug($index, project)) {
          <article class="card">
            <div class="card__header">
              <div>
                <h3>{{ project.title }}</h3>
                <strong>{{ project.category }}</strong>
              </div>
              <app-chip [label]="project.status" [tone]="project.status === 'Live' ? 'success' : project.status === 'InProgress' ? 'warning' : 'neutral'" />
            </div>
            <p>{{ project.description }}</p>
            <div class="card__stack">
              @for (item of project.techStack; track item) {
                <span>{{ item }}</span>
              }
            </div>
            <a [routerLink]="['/projects', project.slug]">View details</a>
          </article>
        }
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .surface {
        display: grid;
        gap: 1.2rem;
        padding: 1.4rem;
        border-radius: 1.4rem;
        border: 1px solid rgba(17, 50, 80, 0.08);
        background: rgba(255, 255, 255, 0.9);
      }

      .toolbar {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: center;
        flex-wrap: wrap;
      }

      input {
        flex: 1 1 18rem;
        min-width: 0;
        border-radius: 999px;
        border: 1px solid #cfd9e4;
        padding: 0.9rem 1rem;
        background: #f9fbfd;
      }

      span {
        color: #61728a;
        font-weight: 600;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
      }

      .card {
        display: grid;
        gap: 0.85rem;
        padding: 1.2rem;
        border-radius: 1.1rem;
        background: #f5f9fc;
      }

      .card__header {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
      }

      h3,
      strong,
      p {
        margin: 0;
      }

      h3 {
        color: #132238;
      }

      strong {
        color: #70839a;
      }

      p {
        color: #5f7088;
        line-height: 1.65;
      }

      .card__stack {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .card__stack span {
        padding: 0.35rem 0.7rem;
        border-radius: 999px;
        background: #e5edf5;
        color: #294864;
        font-size: 0.8rem;
      }

      a {
        width: fit-content;
        text-decoration: none;
        color: #153d5e;
        font-weight: 700;
      }

      @media (max-width: 980px) {
        .grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ProjectsPageComponent {
  readonly trackBySlug = trackBySlug;
  readonly search = signal('');
  readonly projects = toSignal(inject(PortfolioProjectsService).getProjects(), {
    initialValue: [] as Project[],
  });
  readonly filteredProjects = computed(() => {
    const term = this.search().trim().toLowerCase();

    if (!term) {
      return this.projects();
    }

    return this.projects().filter(project =>
      [project.title, project.category, project.techStack.join(' ')].join(' ').toLowerCase().includes(term),
    );
  });
}
