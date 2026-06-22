import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { PortfolioExperienceService } from '@features/portfolio/services/portfolio-experience.service';
import { DataPanelComponent } from '@shared/organisms/data-panel.component';
import { trackById } from '@core/utils/track-by.util';
import { ExperienceItem } from '@shared/models';

@Component({
  selector: 'app-admin-experience-page',
  standalone: true,
  imports: [CommonModule, DataPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-data-panel
      title="Experience management"
      subtitle="Timeline items are ready for future add/edit workflows once backend endpoints exist."
    >
      <div class="list">
        @for (item of experience(); track trackById($index, item)) {
          <article class="experience-card">
            <div class="experience-card__head">
              <div>
                <strong>{{ item.role }}</strong>
                <span>{{ item.company }} · {{ item.location }}</span>
              </div>
              <small>{{ item.startDate | date: 'MMM y' }} - {{ item.current ? 'Present' : (item.endDate | date: 'MMM y') }}</small>
            </div>
            <p>{{ item.summary }}</p>
          </article>
        }
      </div>
    </app-data-panel>
  `,
  styles: [
    `
      .list {
        display: grid;
        gap: 1rem;
      }

      .experience-card {
        display: grid;
        gap: 0.7rem;
        padding: 1rem;
        border-radius: 1rem;
        background: #f5f9fc;
      }

      .experience-card__head {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
      }

      strong {
        display: block;
        color: #132238;
      }

      span,
      small,
      p {
        color: #5f7088;
      }

      p {
        margin: 0;
        line-height: 1.65;
      }

      @media (max-width: 720px) {
        .experience-card__head {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class AdminExperiencePageComponent {
  readonly trackById = trackById;
  readonly experience = toSignal(inject(PortfolioExperienceService).getExperience(), {
    initialValue: [] as ExperienceItem[],
  });
}
