import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PortfolioSkillsService } from '@features/portfolio/services/portfolio-skills.service';
import { PortfolioSkillAdminItem } from '@features/portfolio/models/skills.model';
import { DataPanelComponent } from '@shared/organisms/data-panel.component';
import { ChipComponent } from '@shared/atoms/chip.component';
import { trackById } from '@core/utils/track-by.util';

@Component({
  selector: 'app-admin-skills-page',
  standalone: true,
  imports: [CommonModule, DataPanelComponent, ChipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-data-panel
      title="Skills management"
      subtitle="A concise admin list that can later map directly to ABP CRUD endpoints."
    >
      <input
        panel-actions
        type="search"
        class="search"
        placeholder="Search skill or category"
        [value]="search()"
        (input)="search.set($any($event.target).value)"
      />

      <div class="skills-grid">
        @for (skill of filteredSkills(); track trackById($index, skill)) {
          <article class="skill-card">
            <div>
              <strong>{{ skill.name }}</strong>
              <span>{{ skill.category }}</span>
            </div>
            <div class="skill-card__chips">
              <app-chip [label]="skill.isPrimary ? 'Primary' : 'Secondary'" tone="neutral" />
              <app-chip [label]="skill.isActive ? 'Active' : 'Inactive'" [tone]="skill.isActive ? 'success' : 'warning'" />
            </div>
            <p>Display order {{ skill.displayOrder }}</p>
          </article>
        }
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

      .skills-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1rem;
      }

      .skill-card {
        display: grid;
        gap: 0.8rem;
        padding: 1rem;
        border-radius: 1rem;
        background: #f5f9fc;
      }

      .skill-card__chips {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      strong {
        display: block;
        color: #132238;
      }

      span,
      p {
        color: #5f7088;
      }

      p {
        margin: 0;
      }

      @media (max-width: 1100px) {
        .skills-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 720px) {
        .skills-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AdminSkillsPageComponent {
  readonly trackById = trackById;
  readonly search = signal('');
  readonly skills = toSignal(inject(PortfolioSkillsService).getAdminSkills().pipe(
    map(skills =>
      skills.map(skill => ({
        ...skill,
        category: skill.categoryLabel,
      })),
    ),
  ), {
    initialValue: [] as Array<PortfolioSkillAdminItem & { category: string }>,
  });
  readonly filteredSkills = computed(() => {
    const term = this.search().trim().toLowerCase();
    return term
      ? this.skills().filter(skill => `${skill.name} ${skill.category}`.toLowerCase().includes(term))
      : this.skills();
  });
}
