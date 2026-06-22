import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { PortfolioProjectsService } from '@features/portfolio/services/portfolio-projects.service';
import { ChipComponent } from '@shared/atoms/chip.component';

@Component({
  selector: 'app-project-details-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ChipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (project(); as project) {
      <section class="details">
        <div class="details__header">
          <div>
            <p class="details__eyebrow">{{ project.category }}</p>
            <h1>{{ project.title }}</h1>
            <p class="details__summary">{{ project.description }}</p>
          </div>
          <app-chip [label]="project.status" [tone]="project.status === 'Live' ? 'success' : project.status === 'InProgress' ? 'warning' : 'neutral'" />
        </div>

        <div class="details__grid">
          <article class="details__surface">
            <h2>Tech stack</h2>
            <div class="details__stack">
              @for (item of project.techStack; track item) {
                <span>{{ item }}</span>
              }
            </div>
          </article>

          <article class="details__surface">
            <h2>Delivery summary</h2>
            <p>{{ project.summary }}</p>
            <span>Last updated {{ project.updatedAt | date: 'mediumDate' }}</span>
          </article>
        </div>

        <a routerLink="/projects" class="details__back">Back to projects</a>
      </section>
    } @else {
      <section class="details details--empty">
        <h1>Project not found</h1>
        <p>The requested project slug is not available in the current placeholder dataset.</p>
        <a routerLink="/projects">Return to projects</a>
      </section>
    }
  `,
  styles: [
    `
      .details {
        display: grid;
        gap: 1.2rem;
        padding: 1.5rem;
        border-radius: 1.5rem;
        background: rgba(255, 255, 255, 0.92);
        border: 1px solid rgba(17, 50, 80, 0.08);
      }

      .details__header {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: start;
      }

      .details__eyebrow {
        margin: 0 0 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #6d7d94;
        font-size: 0.8rem;
      }

      h1,
      h2,
      p,
      span {
        margin: 0;
      }

      h1 {
        color: #11283d;
        font-size: clamp(2rem, 4vw, 3rem);
      }

      .details__summary,
      p,
      span {
        color: #5e7088;
        line-height: 1.7;
      }

      .details__summary {
        margin-top: 1rem;
        max-width: 48rem;
      }

      .details__grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
      }

      .details__surface {
        display: grid;
        gap: 0.8rem;
        padding: 1.15rem;
        border-radius: 1.1rem;
        background: #f6f9fc;
      }

      .details__stack {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .details__stack span {
        padding: 0.35rem 0.7rem;
        border-radius: 999px;
        background: #e5edf5;
        color: #244560;
        font-size: 0.82rem;
      }

      .details__back,
      .details--empty a {
        width: fit-content;
        text-decoration: none;
        color: #143d5f;
        font-weight: 700;
      }

      @media (max-width: 900px) {
        .details__header,
        .details__grid {
          grid-template-columns: 1fr;
          display: grid;
        }
      }
    `,
  ],
})
export class ProjectDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly projectsService = inject(PortfolioProjectsService);

  readonly project = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('slug') ?? ''),
      switchMap(slug => this.projectsService.getProjectBySlug(slug)),
    ),
    { initialValue: undefined },
  );
}
