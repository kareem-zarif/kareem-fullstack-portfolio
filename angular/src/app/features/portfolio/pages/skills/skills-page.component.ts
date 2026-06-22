import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (pageState().loading) {
      <section class="page-state" aria-live="polite">
        <span class="page-state__pulse"></span>
        <p>{{ copy().loading }}</p>
      </section>
    } @else if (!categories().length) {
      <section class="page-state page-state--error" role="alert">
        <strong>{{ copy().errorTitle }}</strong>
        <p>{{ copy().errorDescription }}</p>
      </section>
    } @else {
      <div class="skills-page">
        <section class="surface hero" aria-labelledby="skills-page-title">
          <div class="hero__copy">
            <p class="eyebrow">{{ copy().eyebrow }}</p>
            <h1 id="skills-page-title">{{ copy().title }}</h1>
            <p class="hero__summary">{{ copy().summary }}</p>

            <div class="hero__legend" [attr.aria-label]="copy().legendLabel">
              <span class="legend-pill legend-pill--primary">
                <i class="bi bi-stars" aria-hidden="true"></i>
                {{ copy().primaryLegend }}
              </span>
              <span class="legend-pill">
                <i class="bi bi-grid-3x3-gap" aria-hidden="true"></i>
                {{ copy().secondaryLegend }}
              </span>
            </div>

            <dl class="metrics-grid">
              @for (metric of metrics(); track metric.label) {
                <div class="metric-card">
                  <dt>{{ metric.value }}</dt>
                  <dd>{{ metric.label }}</dd>
                </div>
              }
            </dl>

            <div class="hero__actions">
              <a routerLink="/projects" class="button button--primary">{{ copy().viewProjects }}</a>
              <a routerLink="/contact" class="button button--secondary">{{ copy().contactMe }}</a>
            </div>
          </div>

          <div class="hero__featured surface-inset">
            <div class="section-copy">
              <p class="eyebrow">{{ copy().featuredEyebrow }}</p>
              <h2>{{ copy().featuredTitle }}</h2>
              <p>{{ copy().featuredDescription }}</p>
            </div>

            <div class="featured-grid">
              @for (skill of highlightedSkills(); track skill.id) {
                <article class="featured-skill">
                  <span>{{ skill.categoryLabel }}</span>
                  <strong>{{ skill.name }}</strong>
                </article>
              }
            </div>
          </div>
        </section>

        <section class="surface section" aria-labelledby="skills-matrix-title">
          <div class="section-copy section-copy--wide">
            <p class="eyebrow">{{ copy().matrixEyebrow }}</p>
            <h2 id="skills-matrix-title">{{ copy().matrixTitle }}</h2>
            <p>{{ copy().matrixDescription }}</p>
          </div>

          <div class="category-grid">
            @for (category of categories(); track category.category) {
              <article class="category-card">
                <div class="category-card__header">
                  <div class="section-copy">
                    <span class="category-card__kicker">{{ category.categoryLabel }}</span>
                    <h3>{{ getCategoryPrimaryCount(category) }} {{ copy().primaryCountLabel }}</h3>
                    <p>{{ category.skills.length }} {{ skillLabel(category.skills.length) }}</p>
                  </div>

                  <span class="category-card__icon">
                    <i [class]="categoryIcon(category.category)" aria-hidden="true"></i>
                  </span>
                </div>

                <div class="skill-wrap" [attr.aria-label]="category.categoryLabel">
                  @for (skill of category.skills; track skill.id) {
                    <article class="skill-chip" [class.skill-chip--primary]="skill.isPrimary">
                      <strong>{{ skill.name }}</strong>
                      <small>{{ skill.isPrimary ? copy().primaryLabel : copy().secondaryLabel }}</small>
                    </article>
                  }
                </div>
              </article>
            }
          </div>
        </section>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .skills-page {
        display: grid;
        gap: clamp(1.25rem, 2.8vw, 2rem);
        padding-block: clamp(0.5rem, 2vw, 1rem) clamp(1rem, 2.5vw, 1.5rem);
      }

      .surface,
      .page-state {
        position: relative;
        overflow: hidden;
        display: grid;
        gap: 1.5rem;
        padding: clamp(1.25rem, 3.5vw, 2.4rem);
        border: 1px solid var(--portfolio-border);
        border-radius: 2rem;
        background: color-mix(in srgb, var(--portfolio-bg-elevated) 92%, transparent);
        box-shadow: var(--portfolio-shadow);
      }

      .surface::before,
      .page-state::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at top right, color-mix(in srgb, var(--portfolio-accent) 10%, transparent), transparent 38%),
          linear-gradient(180deg, color-mix(in srgb, var(--portfolio-primary) 4%, transparent), transparent 55%);
        pointer-events: none;
      }

      .surface > *,
      .page-state > * {
        position: relative;
        z-index: 1;
      }

      .hero {
        grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
        align-items: start;
        gap: clamp(1.25rem, 3vw, 2rem);
      }

      .hero__copy,
      .hero__featured,
      .section-copy,
      .category-card,
      .metric-card,
      .featured-skill,
      .skill-chip {
        display: grid;
        gap: 0.85rem;
      }

      .surface-inset {
        padding: clamp(1rem, 2vw, 1.4rem);
        border-radius: 1.6rem;
        border: 1px solid color-mix(in srgb, var(--portfolio-border) 78%, transparent);
        background:
          linear-gradient(180deg, color-mix(in srgb, var(--portfolio-bg-soft) 94%, transparent), transparent),
          color-mix(in srgb, var(--portfolio-bg) 55%, transparent);
      }

      .eyebrow,
      .category-card__kicker {
        margin: 0;
        color: var(--portfolio-accent);
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }

      h1,
      h2,
      h3,
      p,
      dl,
      dt,
      dd {
        margin: 0;
      }

      h1,
      h2,
      h3,
      strong {
        color: var(--portfolio-text);
      }

      h1 {
        max-width: 12ch;
        font-size: clamp(2.2rem, 5.2vw, 4.25rem);
        line-height: 0.98;
        letter-spacing: -0.04em;
      }

      h2 {
        font-size: clamp(1.35rem, 2vw, 1.9rem);
        line-height: 1.1;
      }

      h3 {
        font-size: 1.05rem;
      }

      p,
      dd,
      small,
      span {
        color: var(--portfolio-muted);
      }

      .hero__summary,
      .section-copy--wide p {
        max-width: 62ch;
        font-size: 1rem;
        line-height: 1.7;
      }

      .hero__legend,
      .hero__actions,
      .skill-wrap {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
        align-items: center;
      }

      .legend-pill,
      .button,
      .featured-skill,
      .skill-chip {
        border-radius: 1.1rem;
      }

      .legend-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        min-height: 2.8rem;
        padding: 0.78rem 1rem;
        border: 1px solid var(--portfolio-border);
        background: color-mix(in srgb, var(--portfolio-bg-soft) 72%, transparent);
      }

      .legend-pill--primary {
        border-color: color-mix(in srgb, var(--portfolio-primary) 25%, var(--portfolio-border));
        color: var(--portfolio-primary);
        background: color-mix(in srgb, var(--portfolio-primary) 10%, transparent);
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.9rem;
      }

      .metric-card {
        min-height: 8.5rem;
        padding: 1.1rem;
        border: 1px solid var(--portfolio-border);
        border-radius: 1.4rem;
        background: color-mix(in srgb, var(--portfolio-bg-soft) 68%, transparent);
      }

      .metric-card dt {
        color: var(--portfolio-text);
        font-size: clamp(2rem, 5vw, 3rem);
        font-weight: 800;
        letter-spacing: -0.05em;
      }

      .metric-card dd {
        font-size: 0.95rem;
        line-height: 1.5;
      }

      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 3rem;
        padding: 0.9rem 1.2rem;
        font-weight: 700;
        text-decoration: none;
        transition:
          transform 180ms ease,
          border-color 180ms ease,
          background 180ms ease;
      }

      .button:hover {
        transform: translateY(-2px);
      }

      .button--primary {
        border: 1px solid transparent;
        background: linear-gradient(135deg, var(--portfolio-primary), color-mix(in srgb, var(--portfolio-primary) 64%, var(--portfolio-accent)));
        color: var(--portfolio-primary-contrast);
      }

      .button--secondary {
        border: 1px solid var(--portfolio-border);
        background: transparent;
        color: var(--portfolio-text);
      }

      .featured-grid,
      .category-grid {
        display: grid;
        gap: 1rem;
      }

      .featured-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .featured-skill {
        min-height: 7.5rem;
        padding: 1rem;
        border: 1px solid color-mix(in srgb, var(--portfolio-primary) 20%, var(--portfolio-border));
        background:
          linear-gradient(160deg, color-mix(in srgb, var(--portfolio-primary) 12%, transparent), transparent 70%),
          color-mix(in srgb, var(--portfolio-bg-elevated) 95%, transparent);
      }

      .featured-skill strong {
        font-size: 1.1rem;
      }

      .category-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .category-card {
        min-height: 100%;
        padding: 1.2rem;
        border: 1px solid var(--portfolio-border);
        border-radius: 1.6rem;
        background:
          linear-gradient(180deg, color-mix(in srgb, var(--portfolio-bg-soft) 65%, transparent), transparent),
          color-mix(in srgb, var(--portfolio-bg-elevated) 96%, transparent);
      }

      .category-card__header {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: start;
      }

      .category-card__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 3rem;
        height: 3rem;
        border-radius: 1rem;
        background: color-mix(in srgb, var(--portfolio-primary) 11%, transparent);
        color: var(--portfolio-primary);
        font-size: 1.15rem;
      }

      .skill-wrap {
        align-items: stretch;
      }

      .skill-chip {
        flex: 1 1 11rem;
        min-height: 5.6rem;
        padding: 0.95rem 1rem;
        border: 1px solid var(--portfolio-border);
        background: color-mix(in srgb, var(--portfolio-bg) 50%, transparent);
      }

      .skill-chip--primary {
        border-color: color-mix(in srgb, var(--portfolio-primary) 30%, var(--portfolio-border));
        background:
          linear-gradient(135deg, color-mix(in srgb, var(--portfolio-primary) 12%, transparent), transparent 75%),
          color-mix(in srgb, var(--portfolio-bg-elevated) 95%, transparent);
        box-shadow: 0 18px 40px -32px color-mix(in srgb, var(--portfolio-primary) 55%, transparent);
      }

      .page-state {
        min-height: 14rem;
        align-content: center;
        justify-items: center;
        text-align: center;
      }

      .page-state__pulse {
        width: 3rem;
        height: 3rem;
        border-radius: 999px;
        background: color-mix(in srgb, var(--portfolio-primary) 18%, transparent);
        box-shadow:
          0 0 0 0 color-mix(in srgb, var(--portfolio-primary) 18%, transparent),
          0 0 0 1rem color-mix(in srgb, var(--portfolio-primary) 8%, transparent);
      }

      .page-state--error {
        justify-items: start;
        text-align: start;
      }

      @media (prefers-reduced-motion: no-preference) {
        .hero,
        .section,
        .category-card,
        .featured-skill,
        .metric-card,
        .skill-chip {
          animation: float-up 480ms ease both;
        }

        .featured-skill:nth-child(2),
        .metric-card:nth-child(2),
        .category-card:nth-child(2n) {
          animation-delay: 60ms;
        }

        .featured-skill:nth-child(3),
        .metric-card:nth-child(3),
        .category-card:nth-child(3n) {
          animation-delay: 120ms;
        }

        .page-state__pulse {
          animation: pulse 1.8s ease-in-out infinite;
        }

        @keyframes float-up {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(0.95);
            box-shadow:
              0 0 0 0 color-mix(in srgb, var(--portfolio-primary) 20%, transparent),
              0 0 0 1rem color-mix(in srgb, var(--portfolio-primary) 8%, transparent);
          }
          50% {
            transform: scale(1);
            box-shadow:
              0 0 0 0.45rem color-mix(in srgb, var(--portfolio-primary) 8%, transparent),
              0 0 0 1.4rem color-mix(in srgb, var(--portfolio-primary) 4%, transparent);
          }
        }
      }

      @media (max-width: 1120px) {
        .hero,
        .category-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 840px) {
        .metrics-grid,
        .featured-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 640px) {
        h1 {
          max-width: none;
        }

        .metrics-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .hero__actions .button {
          width: 100%;
        }

        .category-card__header {
          flex-direction: column;
        }

        .category-card__icon {
          width: 2.75rem;
          height: 2.75rem;
        }
      }

      @media (max-width: 480px) {
        .metrics-grid {
          grid-template-columns: 1fr;
        }

        .skill-chip {
          flex-basis: 100%;
        }
      }
    `,
  ],
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
