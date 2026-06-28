import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { PublicThemeService } from '@core/services/public-theme.service';
import { getPortfolioCopy } from '@localization/index';
import {
  GetPortfolioProjectListInput,
  PortfolioProjectCard,
  PortfolioProjectList,
} from '@features/portfolio/models';
import { PortfolioProjectsApiService } from '@features/portfolio/services/portfolio-projects-api.service';
import { catchError, map, of, scan, startWith, switchMap } from 'rxjs';

interface ProjectsPageState {
  loading: boolean;
  error: boolean;
  data: PortfolioProjectList | null;
}

type ProjectsPageEvent =
  | { kind: 'loading' }
  | { kind: 'success'; data: PortfolioProjectList }
  | { kind: 'error' };

interface ProjectsMetric {
  value: string;
  label: string;
}

const INITIAL_STATE: ProjectsPageState = {
  loading: true,
  error: false,
  data: null,
};

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div></div>`,
  styles: [],
})
export class ProjectsPageComponent {
  private readonly theme = inject(PublicThemeService);
  private readonly projectsApi = inject(PortfolioProjectsApiService);

  readonly copy = computed(() => getPortfolioCopy(this.theme.language(), 'projectsPage'));
  readonly selectedProjectType = signal<number | null>(null);
  readonly selectedTechnology = signal<string | null>(null);

  private readonly requestFilters = computed<GetPortfolioProjectListInput>(() => ({
    projectType: this.selectedProjectType(),
    technology: this.selectedTechnology(),
  }));

  readonly pageState = toSignal(
    toObservable(this.requestFilters).pipe(
      switchMap(filters =>
        this.projectsApi.getProjectList(filters).pipe(
          map(data => ({ kind: 'success', data }) satisfies ProjectsPageEvent),
          startWith({ kind: 'loading' } satisfies ProjectsPageEvent),
          catchError(() => of({ kind: 'error' } satisfies ProjectsPageEvent)),
        ),
      ),
      scan((state: ProjectsPageState, event: ProjectsPageEvent) => {
        switch (event.kind) {
          case 'loading':
            return {
              ...state,
              loading: true,
              error: false,
            };
          case 'success':
            return {
              loading: false,
              error: false,
              data: event.data,
            };
          case 'error':
            return {
              ...state,
              loading: false,
              error: true,
            };
        }
      }, INITIAL_STATE),
      startWith(INITIAL_STATE),
    ),
    { initialValue: INITIAL_STATE },
  );

  readonly projects = computed(() => this.pageState().data?.items ?? []);
  readonly availableProjectTypes = computed(() => this.pageState().data?.availableProjectTypes ?? []);
  readonly availableTechnologies = computed(() => this.pageState().data?.availableTechnologies ?? []);
  readonly featuredProject = computed(() => this.projects().find(project => project.isFeatured) ?? this.projects()[0] ?? null);
  readonly hasActiveFilters = computed(() => this.selectedProjectType() !== null || this.selectedTechnology() !== null);

  readonly activeFilters = computed(() => {
    const filters: string[] = [];
    const selectedType = this.selectedProjectType();
    const selectedTechnology = this.selectedTechnology();

    if (selectedType !== null) {
      const option = this.availableProjectTypes().find(item => item.value === selectedType);
      filters.push(option?.label ?? String(selectedType));
    }

    if (selectedTechnology) {
      filters.push(selectedTechnology);
    }

    return filters;
  });

  readonly metrics = computed<ProjectsMetric[]>(() => {
    const data = this.pageState().data;

    return [
      {
        value: this.formatMetric(data?.items.length ?? 0),
        label: this.copy().metricProjects,
      },
      {
        value: this.formatMetric(data?.availableProjectTypes.length ?? 0),
        label: this.copy().metricTypes,
      },
      {
        value: this.formatMetric(data?.availableTechnologies.length ?? 0),
        label: this.copy().metricTechnologies,
      },
    ];
  });

  setProjectType(value: string): void {
    const parsedValue = Number(value);
    this.selectedProjectType.set(Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null);
  }

  setTechnology(value: string): void {
    const normalizedValue = value.trim();
    this.selectedTechnology.set(normalizedValue ? normalizedValue : null);
  }

  clearFilters(): void {
    this.selectedProjectType.set(null);
    this.selectedTechnology.set(null);
  }

  projectRoute(project: PortfolioProjectCard): string {
    return project.caseStudyRoute || `/projects/${project.slug}`;
  }

  private formatMetric(value: number): string {
    return String(value).padStart(2, '0');
  }
}
