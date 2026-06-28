import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  PortfolioCallToAction,
  PortfolioCallToActionType,
  PortfolioExperienceSection,
  PortfolioExperienceTimelineItem,
  PortfolioIdentity,
} from '@features/portfolio/models';
import { PortfolioExperienceApiService } from '@features/portfolio/services/portfolio-experience-api.service';
import { PortfolioHomePageApiService } from '@features/portfolio/services/portfolio-home-page-api.service';
import { getPortfolioCopy } from '@localization/index';
import { PublicThemeService } from '@core/services/public-theme.service';
import { catchError, combineLatest, map, of, startWith } from 'rxjs';

interface ExperiencePageState {
  loading: boolean;
  experience: PortfolioExperienceSection | null;
  identity: PortfolioIdentity | null;
}

interface ExperienceMetric {
  value: string;
  label: string;
}

@Component({
  selector: 'app-experience-page',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div></div>`,
  styles: [],
})
export class ExperiencePageComponent {
  private readonly theme = inject(PublicThemeService);
  private readonly experienceApi = inject(PortfolioExperienceApiService);
  private readonly homePageApi = inject(PortfolioHomePageApiService);

  readonly copy = computed(() => getPortfolioCopy(this.theme.language(), 'experiencePage'));

  readonly pageState = toSignal(
    combineLatest({
      experience: this.experienceApi.getExperienceSection().pipe(
        map(data => ({ data, error: false })),
        catchError(() => of({ data: null, error: true })),
      ),
      identity: this.homePageApi.getIdentity().pipe(catchError(() => of(null))),
    }).pipe(
      map(({ experience, identity }) => ({
        loading: false,
        experience: experience.data,
        identity,
      })),
      startWith({
        loading: true,
        experience: null,
        identity: null,
      }),
    ),
    {
      initialValue: {
        loading: true,
        experience: null,
        identity: null,
      } satisfies ExperiencePageState,
    },
  );

  readonly primaryExperience = computed<PortfolioExperienceTimelineItem | null>(() => {
    const items = this.pageState().experience?.timelineItems ?? [];
    return items.find(item => item.isPrimaryProfessionalExperience) ?? items.at(-1) ?? null;
  });

  readonly metrics = computed<ExperienceMetric[]>(() => {
    const experience = this.pageState().experience;
    const primary = this.primaryExperience();

    if (!experience) {
      return [];
    }

    return [
      {
        value: this.formatMetric(experience.timelineItems.length),
        label: this.copy().metricsStages,
      },
      {
        value: this.formatMetric(experience.highlightBadges.length),
        label: this.copy().metricsSignals,
      },
      {
        value: primary?.typeLabel ?? '--',
        label: this.copy().metricsPrimary,
      },
    ];
  });

  readonly featuredActions = computed<PortfolioCallToAction[]>(() => {
    const liveActions = this.pageState().identity?.callToActions;
    if (liveActions?.length) {
      return liveActions.slice(0, 3);
    }

    return [
      {
        type: PortfolioCallToActionType.ViewProjects,
        label: this.copy().defaultViewProjects,
        url: '/projects',
        isExternal: false,
        displayOrder: 1,
        style: 'primary',
      },
      {
        type: PortfolioCallToActionType.ContactMe,
        label: this.copy().defaultContact,
        url: '/contact',
        isExternal: false,
        displayOrder: 2,
        style: 'secondary',
      },
    ];
  });

  isRouterAction(action: PortfolioCallToAction): boolean {
    return !action.isExternal && action.url.startsWith('/') && !action.url.startsWith('/assets/');
  }

  isDownloadAction(action: PortfolioCallToAction): boolean {
    return action.type === PortfolioCallToActionType.DownloadCv;
  }

  ctaClass(action: PortfolioCallToAction): string {
    const style = action.style === 'primary' || action.style === 'secondary' ? action.style : 'link';
    return `cta cta--${style}`;
  }

  actionIcon(type: PortfolioCallToActionType): string {
    switch (type) {
      case PortfolioCallToActionType.ViewProjects:
        return 'bi bi-grid-1x2-fill';
      case PortfolioCallToActionType.DownloadCv:
        return 'bi bi-file-earmark-arrow-down';
      case PortfolioCallToActionType.ContactMe:
        return 'bi bi-chat-square-text';
      case PortfolioCallToActionType.GitHub:
        return 'bi bi-github';
      default:
        return 'bi bi-arrow-right';
    }
  }

  formatMetric(value: number): string {
    return String(value).padStart(2, '0');
  }
}
