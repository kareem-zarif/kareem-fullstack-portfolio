import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { PublicThemeService } from '@core/services/public-theme.service';
import { getPortfolioCopy } from '@localization/index';
import {
  PORTFOLIO_PROJECT_CASE_STUDY_SECTION,
  PortfolioProjectCaseStudy,
} from '@features/portfolio/models';
import { PortfolioExperienceApiService } from '@features/portfolio/services/portfolio-experience-api.service';
import { PortfolioProjectsApiService } from '@features/portfolio/services/portfolio-projects-api.service';
import { PortfolioSkillsService } from '@features/portfolio/services/portfolio-skills.service';
import { SiteSettingsService } from '@features/portfolio/services/site-settings.service';
import { catchError, forkJoin, map, Observable, of, startWith, switchMap } from 'rxjs';

interface ProjectDetailsMetric {
  value: string;
  label: string;
}

interface ApiEndpointCard {
  method: string;
  path: string;
  title: string;
  summary: string;
  stat: string;
  caption: string;
}

interface ApiStorySnapshot {
  projectCount: number;
  projectTypeCount: number;
  currentSectionCount: number;
  currentHighlightCount: number;
  skillCategoryCount: number;
  totalSkillCount: number;
  experienceTimelineCount: number;
  experienceHighlightCount: number;
  siteSettingCount: number;
  sampleSettingKeys: string[];
}

type ApiStoryState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ready'; data: ApiStorySnapshot }
  | { kind: 'error' };

type ProjectDetailsPageState =
  | { kind: 'loading' }
  | { kind: 'ready'; project: PortfolioProjectCaseStudy }
  | { kind: 'not-found' }
  | { kind: 'error' };

const PROJECT_CASE_STUDY_NOT_FOUND_ERROR_CODE = 'kareem_fullstack_portfolio:010518';
const INITIAL_STATE: ProjectDetailsPageState = { kind: 'loading' };

@Component({
  selector: 'app-project-details-page',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div></div>`,
  styles: [],
})
export class ProjectDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly projectsApi = inject(PortfolioProjectsApiService);
  private readonly skillsService = inject(PortfolioSkillsService);
  private readonly experienceApi = inject(PortfolioExperienceApiService);
  private readonly siteSettingsService = inject(SiteSettingsService);
  private readonly theme = inject(PublicThemeService);
  private readonly reloadVersion = signal(0);

  readonly copy = computed(() => getPortfolioCopy(this.theme.language(), 'projectDetailsPage'));
  readonly sectionType = PORTFOLIO_PROJECT_CASE_STUDY_SECTION;

  private readonly slug = toSignal(
    this.route.paramMap.pipe(map(params => params.get('slug')?.trim() ?? '')),
    { initialValue: '' },
  );

  private readonly requestKey = computed(() => ({
    slug: this.slug(),
    reloadVersion: this.reloadVersion(),
  }));

  readonly state = toSignal(
    toObservable(this.requestKey).pipe(switchMap(({ slug }) => this.loadProjectState(slug))),
    { initialValue: INITIAL_STATE },
  );

  readonly project = computed(() => {
    const state = this.state();
    return state.kind === 'ready' ? state.project : null;
  });
  readonly isErpCaseStudy = computed(() => this.project()?.slug === 'enterprise-erp-system');
  readonly isDatabaseEntitiesStory = computed(() => this.project()?.slug === 'story-4-2-database-entities');
  readonly isPublicApiStory = computed(() => this.project()?.slug === 'story-4-3-public-api-endpoints');
  readonly isStructuredStory = computed(() => this.isDatabaseEntitiesStory() || this.isPublicApiStory());
  readonly visibleSections = computed(() =>
    [...(this.project()?.sections ?? [])]
      .filter(section => section.isVisible)
      .sort((left, right) => left.displayOrder - right.displayOrder),
  );
  readonly galleryItems = computed(() =>
    [...(this.project()?.galleryItems ?? [])].sort((left, right) => left.displayOrder - right.displayOrder),
  );
  readonly links = computed(() =>
    [...(this.project()?.links ?? [])].sort((left, right) => left.displayOrder - right.displayOrder),
  );
  private readonly apiStoryRequest = computed(() => {
    const project = this.project();

    if (!project || project.slug !== 'story-4-3-public-api-endpoints') {
      return null;
    }

    return {
      currentSectionCount: project.sections.length,
      currentHighlightCount: project.highlightCards.length,
    };
  });
  readonly apiStoryState = toSignal(
    toObservable(this.apiStoryRequest).pipe(
      switchMap(request =>
        request
          ? forkJoin({
              projectList: this.projectsApi.getProjectList(),
              skills: this.skillsService.getSkillCategories(),
              experience: this.experienceApi.getExperienceSection(),
              siteSettings: this.siteSettingsService.getSiteSettings(),
            }).pipe(
              map(
                ({ projectList, skills, experience, siteSettings }) =>
                  ({
                    kind: 'ready',
                    data: {
                      projectCount: projectList.items.length,
                      projectTypeCount: projectList.availableProjectTypes.length,
                      currentSectionCount: request.currentSectionCount,
                      currentHighlightCount: request.currentHighlightCount,
                      skillCategoryCount: skills.length,
                      totalSkillCount: skills.reduce((total, category) => total + category.skills.length, 0),
                      experienceTimelineCount: experience.timelineItems.length,
                      experienceHighlightCount: experience.highlightBadges.length,
                      siteSettingCount: siteSettings.length,
                      sampleSettingKeys: siteSettings.slice(0, 2).map(setting => setting.key),
                    },
                  }) satisfies ApiStoryState,
              ),
              startWith({ kind: 'loading' } satisfies ApiStoryState),
              catchError(() => of({ kind: 'error' } satisfies ApiStoryState)),
            )
          : of({ kind: 'idle' } satisfies ApiStoryState),
      ),
    ),
    { initialValue: { kind: 'idle' } satisfies ApiStoryState },
  );
  readonly metrics = computed<ProjectDetailsMetric[]>(() => {
    const project = this.project();

    if (!project) {
      return [];
    }

    if (this.isDatabaseEntitiesStory()) {
      return [
        { value: this.formatMetric(project.keyFeatures.length), label: this.copy().metricEntities },
        { value: this.formatMetric(project.architectureNotes.length), label: this.copy().metricRequirements },
        { value: this.formatMetric(project.results.length), label: this.copy().metricAcceptance },
      ];
    }

    if (this.isPublicApiStory()) {
      return [
        { value: this.formatMetric(project.keyFeatures.length), label: this.copy().metricEndpoints },
        { value: this.formatMetric(project.architectureNotes.length), label: this.copy().metricRules },
        { value: this.formatMetric(project.results.length), label: this.copy().metricAcceptance },
      ];
    }

    return [
      { value: this.formatMetric(project.techStack.length), label: this.copy().metricStack },
      { value: this.formatMetric(project.keyFeatures.length), label: this.copy().metricFeatures },
      { value: this.formatMetric(project.results.length), label: this.copy().metricResults },
    ];
  });
  readonly heroSignals = computed(() =>
    this.isDatabaseEntitiesStory()
      ? [this.copy().storySignalScope, this.copy().storySignalCodeFirst, this.copy().storySignalReady]
      : this.isPublicApiStory()
        ? [this.copy().apiSignalAnonymous, this.copy().apiSignalDtos, this.copy().apiSignalValidation]
      : [this.copy().heroSignalBusiness, this.copy().heroSignalResponsive, this.copy().heroSignalTheme],
  );
  readonly apiEndpointCards = computed<ApiEndpointCard[]>(() => {
    const state = this.apiStoryState();

    if (state.kind !== 'ready') {
      return [];
    }

    return [
      {
        method: 'GET',
        path: '/api/projects',
        title: this.copy().apiProjectsCardTitle,
        summary: this.copy().apiProjectsCardSummary,
        stat: this.formatMetric(state.data.projectCount),
        caption: `${this.formatMetric(state.data.projectTypeCount)} ${this.copy().apiProjectTypesCaption}`,
      },
      {
        method: 'GET',
        path: '/api/projects/{slug}',
        title: this.copy().apiProjectDetailsCardTitle,
        summary: this.copy().apiProjectDetailsCardSummary,
        stat: this.formatMetric(state.data.currentSectionCount),
        caption: `${this.formatMetric(state.data.currentHighlightCount)} ${this.copy().apiHighlightsCaption}`,
      },
      {
        method: 'GET',
        path: '/api/skills',
        title: this.copy().apiSkillsCardTitle,
        summary: this.copy().apiSkillsCardSummary,
        stat: this.formatMetric(state.data.totalSkillCount),
        caption: `${this.formatMetric(state.data.skillCategoryCount)} ${this.copy().apiCategoriesCaption}`,
      },
      {
        method: 'GET',
        path: '/api/experience',
        title: this.copy().apiExperienceCardTitle,
        summary: this.copy().apiExperienceCardSummary,
        stat: this.formatMetric(state.data.experienceTimelineCount),
        caption: `${this.formatMetric(state.data.experienceHighlightCount)} ${this.copy().apiBadgesCaption}`,
      },
      {
        method: 'GET',
        path: '/api/site-settings',
        title: this.copy().apiSettingsCardTitle,
        summary: this.copy().apiSettingsCardSummary,
        stat: this.formatMetric(state.data.siteSettingCount),
        caption: state.data.sampleSettingKeys.join(' • '),
      },
      {
        method: 'POST',
        path: '/api/contact',
        title: this.copy().apiContactCardTitle,
        summary: this.copy().apiContactCardSummary,
        stat: this.copy().apiContactCardStat,
        caption: this.copy().apiContactCardCaption,
      },
    ];
  });
  readonly erpSpotlightMetrics = computed<ProjectDetailsMetric[]>(() => {
    const project = this.project();

    if (!project || !this.isErpCaseStudy()) {
      return [];
    }

    return [
      { value: this.formatMetric(project.highlightCards.length), label: this.copy().metricHighlights },
      { value: this.formatMetric(project.architectureNotes.length), label: this.copy().metricArchitecture },
      { value: this.formatMetric(project.keyFeatures.length), label: this.copy().metricFeatures },
    ];
  });

  retry(): void {
    this.reloadVersion.update(value => value + 1);
  }

  hasVisibleSection(type: number): boolean {
    return this.visibleSections().some(section => section.type === type);
  }

  sectionLabel(type: number): string {
    return this.visibleSections().find(section => section.type === type)?.label ?? '';
  }

  sectionAnchor(type: number): string {
    switch (type) {
      case this.sectionType.overview:           return 'section-overview';
      case this.sectionType.businessProblem:    return 'section-business-problem';
      case this.sectionType.solution:           return 'section-solution';
      case this.sectionType.kareemRole:         return 'section-kareem-role';
      case this.sectionType.techStack:          return 'section-tech-stack';
      case this.sectionType.keyFeatures:        return 'section-key-features';
      case this.sectionType.architectureNotes:  return 'section-architecture-notes';
      case this.sectionType.gallery:            return 'section-gallery';
      case this.sectionType.resultsImpact:      return 'section-results-impact';
      case this.sectionType.links:              return 'section-links';
      default:                                  return `section-${type}`;
    }
  }

  private loadProjectState(slug: string): Observable<ProjectDetailsPageState> {
    if (!slug) {
      return of({ kind: 'not-found' });
    }

    return this.projectsApi.getProjectBySlug(slug).pipe(
      map(project => ({ kind: 'ready', project }) satisfies ProjectDetailsPageState),
      startWith(INITIAL_STATE),
      catchError(error => of(this.mapErrorToState(error))),
    );
  }

  private mapErrorToState(error: unknown): ProjectDetailsPageState {
    return this.isNotFoundError(error) ? { kind: 'not-found' } : { kind: 'error' };
  }

  private isNotFoundError(error: unknown): boolean {
    if (!(error instanceof HttpErrorResponse)) {
      return false;
    }

    if (error.status === 404) {
      return true;
    }

    return this.extractErrorCodes(error.error).includes(PROJECT_CASE_STUDY_NOT_FOUND_ERROR_CODE);
  }

  private extractErrorCodes(errorBody: unknown): string[] {
    if (!errorBody || typeof errorBody !== 'object') {
      return [];
    }

    const body = errorBody as Record<string, unknown>;
    const nestedError = body['error'];
    const nestedObject =
      nestedError && typeof nestedError === 'object' ? (nestedError as Record<string, unknown>) : undefined;

    return [body['code'], nestedObject?.['code']].filter((value): value is string => typeof value === 'string');
  }

  private formatMetric(value: number): string {
    return String(value).padStart(2, '0');
  }

  storyCardTitle(value: string): string {
    const separatorIndex = value.indexOf(':');
    return separatorIndex >= 0 ? value.slice(0, separatorIndex).trim() : value;
  }

  storyCardSummary(value: string): string {
    const separatorIndex = value.indexOf(':');
    return separatorIndex >= 0 ? value.slice(separatorIndex + 1).trim() : value;
  }
}
