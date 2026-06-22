import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AppShellService } from '@core/services/app-shell.service';
import { PublicThemeService } from '@core/services/public-theme.service';
import { trackByRoute } from '@core/utils/track-by.util';
import { PortfolioHomePageApiService } from '@features/portfolio/services/portfolio-home-page-api.service';
import { catchError, of, switchMap } from 'rxjs';

const FOOTER_COPY = {
  en: {
    explore: 'Explore',
    connect: 'Connect',
    defaultSummary: 'I build business systems that feel calm, fast, and useful.',
    copyright: 'Crafted for recruiters, hiring managers, and product teams.',
  },
  ar: {
    explore: 'استكشف',
    connect: 'تواصل',
    defaultSummary: 'أبني أنظمة أعمال واضحة وسريعة وسهلة الاستخدام.',
    copyright: 'مصمم لمديري التوظيف والفرق التقنية وأصحاب المنتجات.',
  },
} as const;

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div class="footer__brand">
        <strong>{{ brandName() }}</strong>
        <p>{{ summary() }}</p>
      </div>

      <div class="footer__group">
        <span class="footer__label">{{ copy().explore }}</span>
        <div class="footer__links">
          @for (item of navigationItems(); track trackByRoute($index, item)) {
            <a [routerLink]="item.path">{{ item.label }}</a>
          }
        </div>
      </div>

      <div class="footer__group">
        <span class="footer__label">{{ copy().connect }}</span>
        <div class="footer__social">
          @for (link of footerLinks(); track link.type) {
            @if (resolveHref(link); as href) {
              <a
                [attr.href]="href"
                [attr.target]="link.isExternal ? '_blank' : null"
                [attr.rel]="link.isExternal ? 'noreferrer' : null"
                [attr.download]="shell.isDownloadLink(link) ? '' : null"
              >
                {{ link.label }}
              </a>
            } @else {
              <span class="footer__disabled">{{ link.label }}</span>
            }
          }
        </div>
      </div>

      <div class="footer__meta">
        <span>{{ title() }}</span>
        <span>{{ currentYear }} • {{ copy().copyright }}</span>
      </div>
    </footer>
  `,
  styles: [
    `
      .footer {
        display: grid;
        grid-template-columns: minmax(0, 1.25fr) repeat(2, minmax(0, 0.9fr));
        gap: 1.25rem;
        width: min(100%, 1440px);
        margin: 0 auto;
        padding: 1.2rem clamp(1rem, 4vw, 2.75rem) 2.75rem;
        color: var(--portfolio-muted);
      }

      .footer__brand,
      .footer__group,
      .footer__meta {
        border: 1px solid var(--portfolio-border);
        border-radius: 1.45rem;
        background: color-mix(in srgb, var(--portfolio-bg-elevated) 88%, transparent);
        box-shadow: var(--portfolio-shadow);
        padding: 1.4rem;
      }

      strong,
      .footer__label,
      .footer__meta span:first-child {
        color: var(--portfolio-text);
      }

      p {
        margin: 0.45rem 0 0;
        max-width: 32rem;
        line-height: 1.75;
      }

      .footer__label {
        display: inline-block;
        margin-block-end: 0.85rem;
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .footer__links,
      .footer__social {
        display: grid;
        gap: 0.7rem;
      }

      .footer__meta {
        align-content: space-between;
      }

      a {
        display: inline-flex;
        align-items: center;
        min-height: 2.85rem;
        border: 1px solid var(--portfolio-border);
        border-radius: 999px;
        padding: 0.78rem 1rem;
        background: color-mix(in srgb, var(--portfolio-bg-soft) 68%, transparent);
        color: var(--portfolio-primary);
        text-decoration: none;
        font-weight: 600;
        transition:
          transform 180ms ease,
          border-color 180ms ease,
          background 180ms ease;
      }

      a:hover {
        transform: translateY(-1px);
        border-color: color-mix(in srgb, var(--portfolio-primary) 28%, var(--portfolio-border));
      }

      .footer__disabled {
        display: inline-flex;
        align-items: center;
        min-height: 2.85rem;
        border-radius: 999px;
        padding: 0.78rem 1rem;
        border: 1px dashed var(--portfolio-border);
        color: var(--portfolio-muted);
      }

      @media (max-width: 900px) {
        .footer {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class PublicFooterComponent {
  readonly currentYear = new Date().getFullYear();
  readonly shell = inject(AppShellService);
  readonly theme = inject(PublicThemeService);
  readonly trackByRoute = trackByRoute;
  readonly copy = computed(() => FOOTER_COPY[this.theme.language()]);
  private readonly homePageApi = inject(PortfolioHomePageApiService);
  private readonly publicShell = toSignal(this.shell.publicShell$.pipe(catchError(() => of(null))), { initialValue: null });
  private readonly navigation = toSignal(this.shell.publicNavigation$.pipe(catchError(() => of([]))), { initialValue: [] });
  private readonly footer = toSignal(this.shell.publicFooterLinks$.pipe(catchError(() => of([]))), { initialValue: [] });
  private readonly identity = toSignal(
    toObservable(this.theme.language).pipe(
      switchMap(() => this.homePageApi.getIdentity().pipe(catchError(() => of(null)))),
    ),
    { initialValue: null },
  );

  readonly brandName = computed(() => this.publicShell()?.brandName ?? this.identity()?.fullName ?? 'Kareem Zarif');
  readonly title = computed(
    () => this.identity()?.professionalTitle ?? 'Business-oriented .NET and Angular full-stack developer',
  );
  readonly summary = computed(() => this.identity()?.mainMessage ?? this.copy().defaultSummary);
  readonly navigationItems = computed(() => this.navigation());
  readonly footerLinks = computed(() => this.footer());

  resolveHref(link: Parameters<AppShellService['resolveFooterHref']>[0]): string | null {
    return this.shell.resolveFooterHref(link);
  }
}
