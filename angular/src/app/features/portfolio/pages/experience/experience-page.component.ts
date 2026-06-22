import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { PortfolioExperienceService } from '@features/portfolio/services/portfolio-experience.service';
import { SectionHeaderComponent } from '@shared/molecules/section-header.component';
import { trackById } from '@core/utils/track-by.util';
import { ExperienceItem } from '@shared/models';

@Component({
  selector: 'app-experience-page',
  standalone: true,
  imports: [CommonModule, SectionHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="surface">
      <app-section-header
        eyebrow="Experience"
        title="Operational delivery, not just demos"
        description="This section mirrors the kind of concise timeline hiring teams expect, while remaining ready for richer SFD-driven content later."
      />

      <div class="timeline">
        @for (item of experience(); track trackById($index, item)) {
          <article class="timeline__item">
            <div class="timeline__period">
              <strong>{{ item.startDate | date: 'MMM y' }}</strong>
              <span>{{ item.current ? 'Present' : (item.endDate | date: 'MMM y') }}</span>
            </div>
            <div class="timeline__body">
              <h3>{{ item.role }}</h3>
              <p class="timeline__company">{{ item.company }} · {{ item.location }}</p>
              <p>{{ item.summary }}</p>
              <ul>
                @for (achievement of item.achievements; track achievement) {
                  <li>{{ achievement }}</li>
                }
              </ul>
            </div>
          </article>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .surface {
        display: grid;
        gap: 1.2rem;
        padding: 1.4rem;
        border-radius: 1.4rem;
        background: rgba(255, 255, 255, 0.92);
        border: 1px solid rgba(17, 50, 80, 0.08);
      }

      .timeline {
        display: grid;
        gap: 1rem;
      }

      .timeline__item {
        display: grid;
        grid-template-columns: 180px minmax(0, 1fr);
        gap: 1rem;
        padding: 1.1rem;
        border-radius: 1rem;
        background: #f5f9fc;
      }

      .timeline__period {
        display: grid;
        gap: 0.3rem;
      }

      .timeline__period strong {
        color: #132238;
      }

      .timeline__period span,
      .timeline__company,
      p,
      li {
        color: #5f7088;
      }

      h3,
      p,
      ul {
        margin: 0;
      }

      ul {
        padding-left: 1.1rem;
        margin-top: 0.85rem;
      }

      li + li {
        margin-top: 0.35rem;
      }

      @media (max-width: 840px) {
        .timeline__item {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ExperiencePageComponent {
  readonly trackById = trackById;
  readonly experience = toSignal(inject(PortfolioExperienceService).getExperience(), {
    initialValue: [] as ExperienceItem[],
  });
}
