import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PortfolioSkillCategoryGroup, PortfolioSkillItem } from '@features/portfolio/models/skills.model';
import { PortfolioSkillsService } from '@features/portfolio/services/portfolio-skills.service';
import { getPortfolioCopy } from '@localization/index';
import { PublicThemeService } from '@core/services/public-theme.service';
import { catchError, map, of, startWith } from 'rxjs';

interface SkillsPageState {
  loading: boolean;
  categories: PortfolioSkillCategoryGroup[] | null;
}

interface SkillsMetric {
  value: string;
  label: string;
}

interface HighlightedSkill extends PortfolioSkillItem {
  categoryLabel: string;
}

@Component({
  selector: 'app-skills-page',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div></div>`,
  styles: [],
})
export class SkillsPageComponent {
  private readonly skillsService = inject(PortfolioSkillsService);
  private readonly theme = inject(PublicThemeService);

  readonly copy = computed(() => getPortfolioCopy(this.theme.language(), 'skillsPage'));
  readonly pageState = toSignal(
    this.skillsService.getSkillCategories().pipe(
      map(categories => ({ loading: false, categories })),
      startWith({ loading: true, categories: null }),
      catchError(() => of({ loading: false, categories: null })),
    ),
    {
      initialValue: { loading: true, categories: null } as SkillsPageState,
    },
  );

  readonly categories = computed(() => this.pageState().categories ?? []);
  readonly highlightedSkills = computed<HighlightedSkill[]>(() =>
    this.categories()
      .flatMap(category =>
        category.skills
          .filter(skill => skill.isPrimary)
          .map(skill => ({ ...skill, categoryLabel: category.categoryLabel })),
      )
      .slice(0, 10),
  );

  readonly metrics = computed<SkillsMetric[]>(() => {
    const categories = this.categories();
    const totalSkills = categories.reduce((sum, category) => sum + category.skills.length, 0);
    const totalPrimary = categories.reduce((sum, category) => sum + this.getCategoryPrimaryCount(category), 0);

    return [
      { value: String(totalSkills), label: this.copy().metricTotalSkills },
      { value: String(totalPrimary), label: this.copy().metricPrimarySkills },
      { value: String(categories.length), label: this.copy().metricCategories },
    ];
  });

  getCategoryPrimaryCount(category: PortfolioSkillCategoryGroup): number {
    return category.skills.filter(skill => skill.isPrimary).length;
  }

  skillLabel(count: number): string {
    return count === 1 ? this.copy().singleSkillLabel : this.copy().pluralSkillLabel;
  }

  categoryIcon(category: number): string {
    switch (category) {
      case 1:
        return 'bi bi-hdd-stack';
      case 2:
        return 'bi bi-window-stack';
      case 3:
        return 'bi bi-database';
      case 4:
        return 'bi bi-diagram-3';
      case 5:
        return 'bi bi-tools';
      case 6:
        return 'bi bi-people';
      default:
        return 'bi bi-lightning-charge';
    }
  }
}
