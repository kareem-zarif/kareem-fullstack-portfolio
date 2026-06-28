import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PublicThemeService } from '@core/services/public-theme.service';
import { getPortfolioCopy } from '@localization/index';
import {
  PortfolioCallToAction,
  PortfolioCallToActionType,
  PortfolioHomeFeaturedProject,
  PortfolioHomePage,
  PortfolioIdentity,
} from '@features/portfolio/models';
import { PortfolioHomePageApiService } from '@features/portfolio/services/portfolio-home-page-api.service';
import { catchError, combineLatest, map, of, startWith } from 'rxjs';
import { HeroSectionComponent, HeroStack } from '@shared/organisms/hero-section.component';

interface HomePageState {
  data: PortfolioHomePage | null;
  identity: PortfolioIdentity | null;
  loading: boolean;
  detailsError: boolean;
}

/* Default tech stack shown while API loads or if API omits it */
const DEFAULT_STACK: HeroStack[] = [
  { label: 'ASP.NET Core', accent: 'lime' },
  { label: 'Angular',      accent: 'lime' },
  { label: 'SQL Server',   accent: 'teal' },
  { label: 'EF Core',      accent: 'lime' },
  { label: 'JWT Auth',     accent: 'info' },
  { label: 'Azure',        accent: 'info' },
];

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [HeroSectionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-hero-section
      [greeting]="copy().heroGreeting"
      [fullName]="identity()?.fullName ?? 'Kareem Zarif'"
      [heroLead]="copy().heroLead"
      [heroAccent]="copy().heroAccent"
      [heroTail]="copy().heroTail"
      [professionalTitle]="identity()?.professionalTitle ?? copy().heroTitle"
      [summary]="identity()?.businessSummary ?? ''"
      [callToActions]="ctaActions()"
      [stack]="stack()"
      [stackLabel]="copy().heroStackLabel"
      [availabilityBadge]="copy().heroBadge"
      [winTitle]="copy().heroWinTitle"
      [secureLabel]="copy().heroSecure"
    />
  `,
  styles: [],
})
export class HomePageComponent {
  private readonly homePageApi = inject(PortfolioHomePageApiService);
  private readonly theme = inject(PublicThemeService);

  readonly copy = computed(() => getPortfolioCopy(this.theme.language(), 'homePage'));

  private readonly _state = toSignal(
    combineLatest({
      identity: this.homePageApi.getIdentity().pipe(catchError(() => of(null))),
      details: this.homePageApi.getHomePage().pipe(
        map(data => ({ data, error: false })),
        catchError(() => of({ data: null as PortfolioHomePage | null, error: true })),
      ),
    }).pipe(
      map(({ identity, details }) => ({
        data:         details.data,
        identity,
        loading:      false,
        detailsError: details.error,
      })),
      startWith({ data: null, identity: null, loading: true, detailsError: false }),
    ),
    { initialValue: { data: null, identity: null, loading: true, detailsError: false } satisfies HomePageState },
  );

  readonly identity = computed(() => this._state().identity);

  /** All CTAs from identity, ordered by displayOrder */
  readonly ctaActions = computed<PortfolioCallToAction[]>(() =>
    (this._state().identity?.callToActions ?? [])
      .slice()
      .sort((a, b) => a.displayOrder - b.displayOrder),
  );

  /** Build tech stack from home-page tech cards, fall back to defaults */
  readonly stack = computed<HeroStack[]>(() => {
    const cards = this._state().data?.techStackCards;
    if (!cards?.length) return DEFAULT_STACK;

    const accentMap: Record<number, HeroStack['accent']> = { 1: 'lime', 2: 'teal', 3: 'info' };
    return cards
      .slice()
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .flatMap(c =>
        c.technologies.map((tech, i) => ({
          label:  tech,
          accent: accentMap[(c.type % 3) + 1] ?? (i % 3 === 0 ? 'lime' : i % 3 === 1 ? 'teal' : 'info'),
        })),
      )
      .slice(0, 8);
  });

  readonly featuredProject = computed<PortfolioHomeFeaturedProject | null>(() => {
    const page = this._state().data;
    if (!page?.featuredProjects.length) return null;
    return (
      page.featuredProjects.find(p => p.caseStudyRoute === page.erpExperienceHighlight.projectRoute) ??
      page.featuredProjects[0]
    );
  });

  isDownloadAction(action: PortfolioCallToAction): boolean {
    return action.type === PortfolioCallToActionType.DownloadCv;
  }

  projectRoute(project: PortfolioHomeFeaturedProject): string {
    return project.caseStudyRoute || `/projects/${project.slug}`;
  }
}
