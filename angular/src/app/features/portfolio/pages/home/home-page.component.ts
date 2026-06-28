import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PublicThemeService } from '@core/services/public-theme.service';
import { getPortfolioCopy } from '@localization/index';
import {
  PortfolioCallToAction,
  PortfolioCallToActionType,
  PortfolioHomeFeaturedProject,
  PortfolioHomePage,
  PortfolioHomeProfessionalLink,
  PortfolioIdentity,
} from '@features/portfolio/models';
import { PortfolioHomePageApiService } from '@features/portfolio/services/portfolio-home-page-api.service';
import { catchError, combineLatest, map, of, startWith } from 'rxjs';

interface HomePageState {
  data: PortfolioHomePage | null;
  identity: PortfolioIdentity | null;
  loading: boolean;
  detailsError: boolean;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div></div>`,
  styles: [],
})
export class HomePageComponent {
  private readonly homePageApi = inject(PortfolioHomePageApiService);
  private readonly theme = inject(PublicThemeService);

  readonly copy = computed(() => getPortfolioCopy(this.theme.language(), 'homePage'));

  readonly homeState = toSignal(
    combineLatest({
      identity: this.homePageApi.getIdentity().pipe(catchError(() => of(null))),
      details: this.homePageApi.getHomePage().pipe(
        map(data => ({ data, error: false })),
        catchError(() => of({ data: null, error: true })),
      ),
    }).pipe(
      map(({ identity, details }) => ({
        data: details.data,
        identity,
        loading: false,
        detailsError: details.error,
      })),
      startWith({ data: null, identity: null, loading: true, detailsError: false }),
    ),
    {
      initialValue: { data: null, identity: null, loading: true, detailsError: false } satisfies HomePageState,
    },
  );

  readonly professionalLinks = computed(() => this.homeState().data?.professionalLinks ?? []);

  readonly heroActions = computed(() =>
    this.homeState().identity?.callToActions.filter(
      a => a.type === PortfolioCallToActionType.DownloadCv || a.type === PortfolioCallToActionType.GitHub,
    ) ?? [],
  );

  readonly linkedInLinks = computed(() =>
    this.professionalLinks().filter(link => link.type === 2),
  );

  readonly featuredProject = computed<PortfolioHomeFeaturedProject | null>(() => {
    const page = this.homeState().data;
    if (!page?.featuredProjects.length) {
      return null;
    }

    return (
      page.featuredProjects.find(project => project.caseStudyRoute === page.erpExperienceHighlight.projectRoute) ??
      page.featuredProjects[0]
    );
  });

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

  professionalLinkIcon(link: PortfolioHomeProfessionalLink): string {
    switch (link.type) {
      case 1:
        return 'bi bi-github';
      case 2:
        return 'bi bi-linkedin';
      default:
        return 'bi bi-link-45deg';
    }
  }

  projectRoute(project: PortfolioHomeFeaturedProject): string {
    return project.caseStudyRoute || `/projects/${project.slug}`;
  }
}
