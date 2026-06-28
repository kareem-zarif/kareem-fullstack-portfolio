import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EyebrowBadgeComponent } from '@shared/molecules/eyebrow-badge.component';
import { TechChipComponent, TechChipAccent } from '@shared/atoms/tech-chip.component';
import { PortfolioBtnComponent } from '@shared/atoms/portfolio-btn.component';
import { ErpProductWindowComponent } from '@shared/organisms/erp-product-window.component';
import { PortfolioCallToAction, PortfolioCallToActionType } from '@features/portfolio/models';

export interface HeroStack {
  label: string;
  accent: TechChipAccent;
}

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [
    EyebrowBadgeComponent,
    TechChipComponent,
    PortfolioBtnComponent,
    ErpProductWindowComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero" id="hero">

      <!-- ── Copy column ──────────────────────────────────────────────────── -->
      <div class="hero-copy">

        <app-eyebrow-badge [text]="availabilityBadge()" data-rise="0" />

        <div class="identity" data-rise="1">
          <p class="greeting">{{ greeting() }}</p>
          <p class="name-line">{{ fullName() }}</p>
          <h1 class="headline">
            <span>{{ heroLead() }}</span>
            <span class="accent">{{ heroAccent() }}</span>
            <span>{{ heroTail() }}</span>
          </h1>
          <p class="title-line" data-rise="2">
            <span>{{ professionalTitle() }}</span>
          </p>
        </div>

        <p class="summary" data-rise="3">{{ summary() }}</p>

        <!-- CTA buttons -->
        <div class="cta-row" data-rise="4">
          @for (cta of callToActions(); track cta.type) {
            @if (isViewProjects(cta)) {
              <app-portfolio-btn
                variant="primary"
                size="lg"
                routerPath="/projects"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                {{ cta.label }}
              </app-portfolio-btn>
            } @else if (isDownloadCv(cta)) {
              <app-portfolio-btn
                variant="outline"
                size="lg"
                [href]="cta.url"
                [external]="cta.isExternal"
                download="Kareem-Zarif-CV"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                {{ cta.label }}
              </app-portfolio-btn>
            } @else if (isContactMe(cta)) {
              <app-portfolio-btn
                variant="outline"
                size="lg"
                routerPath="/contact"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {{ cta.label }}
              </app-portfolio-btn>
            } @else if (isGitHub(cta)) {
              <app-portfolio-btn
                variant="ghost"
                size="lg"
                [href]="cta.url"
                [external]="true"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z"/></svg>
                {{ cta.label }}
              </app-portfolio-btn>
            }
          }
        </div>

        <!-- Tech stack strip -->
        @if (stack().length) {
          <div class="tech-strip" data-rise="5">
            <p class="tech-label">{{ stackLabel() }}</p>
            <div class="chips">
              @for (item of stack(); track item.label) {
                <app-tech-chip [label]="item.label" [accent]="item.accent" />
              }
            </div>
          </div>
        }
      </div>

      <!-- ── Visual column ─────────────────────────────────────────────────── -->
      <app-erp-product-window
        [winTitle]="winTitle()"
        [secureLabel]="secureLabel()"
      />

    </section>
  `,
  styles: [`
    .hero {
      position: relative;
      z-index: 1;
      max-width: var(--rail, 1180px);
      margin: 0 auto;
      padding: clamp(40px, 7vw, 92px) 28px clamp(56px, 8vw, 104px);
      display: grid;
      grid-template-columns: 1.05fr .95fr;
      gap: clamp(32px, 5vw, 72px);
      align-items: center;
    }

    /* ── Identity block ─────────────────────────────────────────────────── */
    .identity { margin-top: 22px; }

    .greeting {
      font-size: clamp(15px, 1.6vw, 17px);
      font-weight: 500;
      color: var(--text-faint, #9a9c95);
      margin: 0 0 6px;
    }

    .name-line {
      font-size: clamp(13px, 1.5vw, 15px);
      font-weight: 700;
      letter-spacing: .14em;
      text-transform: uppercase;
      color: var(--accent-text, #b2e742);
      margin: 0 0 14px;
    }

    html[lang="ar"] .name-line { letter-spacing: .04em; }

    .headline {
      font-size: clamp(2.3rem, 5.6vw, 4.15rem);
      line-height: 1.04;
      font-weight: 700;
      letter-spacing: -.02em;
      margin: 0;
      color: var(--text, #f4f5f0);
      text-wrap: balance;
    }

    html[lang="ar"] .headline { letter-spacing: 0; line-height: 1.18; }

    .headline .accent {
      color: var(--accent-text, #b2e742);
      position: relative;
      white-space: nowrap;
    }

    .headline .accent::after {
      content: "";
      left: 0; right: 0;
      bottom: .04em;
      height: .14em;
      position: absolute;
      background: var(--accent-line, #b2e742);
      opacity: .26;
      border-radius: 4px;
    }

    .title-line {
      margin: 22px 0 0;
      font-size: clamp(1.05rem, 1.9vw, 1.4rem);
      font-weight: 600;
      color: var(--text, #f4f5f0);
    }

    /* ── Summary ──────────────────────────────────────────────────────────── */
    .summary {
      margin: 20px 0 0;
      max-width: 46ch;
      font-size: clamp(1rem, 1.5vw, 1.12rem);
      line-height: 1.65;
      color: var(--text-muted, #c7c9c2);
      text-wrap: pretty;
    }

    /* ── CTA row ─────────────────────────────────────────────────────────── */
    .cta-row {
      margin-top: 30px;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    /* ── Tech strip ───────────────────────────────────────────────────────── */
    .tech-strip {
      margin-top: 30px;
      padding-top: 26px;
      border-top: 1px dashed var(--border, #2e2e2e);
    }

    .tech-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: var(--text-faint, #9a9c95);
      margin: 0 0 12px;
    }

    html[lang="ar"] .tech-label { letter-spacing: .04em; }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
    }

    /* ── Responsive ───────────────────────────────────────────────────────── */
    @media (max-width: 1080px) {
      .hero { grid-template-columns: 1fr; gap: 48px; }
      app-erp-product-window { order: 2; max-width: 480px; justify-self: center; }
      .summary { max-width: 56ch; }
    }

    @media (max-width: 760px) {
      .hero { padding: 36px 18px 80px; }
      .cta-row app-portfolio-btn { flex: 1 1 calc(50% - 12px); }
    }

    @media (max-width: 420px) {
      .cta-row app-portfolio-btn { flex: 1 1 100%; }
    }

    @media (min-width: 1600px) {
      .hero { padding-top: 110px; }
    }
  `],
})
export class HeroSectionComponent {
  /* Data from parent (home page) */
  readonly greeting = input('Hi, I\'m');
  readonly fullName = input('Kareem Zarif');
  readonly heroLead = input('I build ');
  readonly heroAccent = input('business systems');
  readonly heroTail = input(', not just screens.');
  readonly professionalTitle = input('Business-Oriented .NET Full Stack Developer');
  readonly summary = input('');
  readonly callToActions = input<PortfolioCallToAction[]>([]);
  readonly stack = input<HeroStack[]>([]);
  readonly stackLabel = input('Core Stack');
  readonly availabilityBadge = input('Available for opportunities');
  readonly winTitle = input('Enterprise ERP');
  readonly secureLabel = input('Role-based access');

  isViewProjects(cta: PortfolioCallToAction) {
    return cta.type === PortfolioCallToActionType.ViewProjects;
  }

  isDownloadCv(cta: PortfolioCallToAction) {
    return cta.type === PortfolioCallToActionType.DownloadCv;
  }

  isContactMe(cta: PortfolioCallToAction) {
    return cta.type === PortfolioCallToActionType.ContactMe;
  }

  isGitHub(cta: PortfolioCallToAction) {
    return cta.type === PortfolioCallToActionType.GitHub;
  }
}
