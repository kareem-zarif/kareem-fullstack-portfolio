import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AppShellService } from '@core/services/app-shell.service';
import { PortfolioFooterLinkModel } from '@core/models/app-navigation.model';
import { PortfolioHomePageApiService } from '@features/portfolio/services/portfolio-home-page-api.service';
import { catchError, of } from 'rxjs';

const FALLBACK_FOOTER_LINKS: PortfolioFooterLinkModel[] = [
  { type: 1, label: 'GitHub',   url: '', isExternal: true,  isConfigured: false, displayOrder: 1 },
  { type: 2, label: 'LinkedIn', url: '', isExternal: true,  isConfigured: false, displayOrder: 2 },
  { type: 3, label: 'Email',    url: '', isExternal: false, isConfigured: false, displayOrder: 3 },
];

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer" role="contentinfo">
      <div class="footer-inner">
        <span class="copy">{{ copyrightLine() }}</span>

        <nav class="socials" [attr.aria-label]="'Social links'">
          @for (link of visibleLinks(); track link.type) {
            <a
              [attr.href]="shell.resolveFooterHref(link)"
              [attr.aria-label]="link.label"
              [attr.target]="link.isExternal ? '_blank' : null"
              [attr.rel]="link.isExternal ? 'noopener noreferrer' : null"
              [attr.download]="shell.isDownloadLink(link) ? '' : null"
            >
              @switch (link.type) {
                @case (1) {
                  <!-- GitHub -->
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z"/>
                  </svg>
                }
                @case (2) {
                  <!-- LinkedIn -->
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.55V9h3.57v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.23 0Z"/>
                  </svg>
                }
                @case (3) {
                  <!-- Email -->
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                }
                @default {
                  <!-- CV / Download -->
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                }
              }
            </a>
          }
        </nav>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      position: relative;
      z-index: 1;
      border-top: 1px solid var(--border, #2e2e2e);
      margin-top: 8px;
      transition: border-color var(--dur, 240ms) var(--ease);
    }

    .footer-inner {
      max-width: var(--rail, 1180px);
      margin: 0 auto;
      padding: 26px 28px;
      display: flex;
      align-items: center;
      gap: 18px;
      flex-wrap: wrap;
    }

    .copy {
      font-size: 13px;
      color: var(--text-faint, #9a9c95);
    }

    .socials {
      margin-inline-start: auto;
      display: flex;
      gap: 8px;
      list-style: none;
    }

    .socials a {
      width: 38px;
      height: 38px;
      border-radius: var(--r-sm, 6px);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--surface, #1e1e1e);
      border: 1px solid var(--border, #2e2e2e);
      color: var(--text-muted, #c7c9c2);
      transition:
        color var(--dur-fast, 150ms) var(--ease),
        border-color var(--dur-fast, 150ms) var(--ease),
        transform var(--dur-fast, 150ms) var(--ease),
        background var(--dur-fast, 150ms) var(--ease);
    }

    .socials a:hover {
      color: var(--text, #f4f5f0);
      border-color: var(--accent-line, #b2e742);
      transform: translateY(-2px);
    }

    .socials svg {
      width: 17px;
      height: 17px;
      flex-shrink: 0;
    }

    @media (max-width: 760px) {
      .footer-inner { padding-left: 18px; padding-right: 18px; }
    }

    @media (max-width: 520px) {
      .socials { margin-inline-start: 0; }
    }
  `],
})
export class PublicFooterComponent {
  readonly shell = inject(AppShellService);
  private readonly homePageApi = inject(PortfolioHomePageApiService);

  private readonly _identity = toSignal(
    this.homePageApi.getIdentity().pipe(catchError(() => of(null))),
    { initialValue: null },
  );

  private readonly _footerLinks = toSignal(
    this.shell.publicFooterLinks$.pipe(catchError(() => of([]))),
    { initialValue: [] as PortfolioFooterLinkModel[] },
  );

  readonly visibleLinks = computed(() => {
    const configured = this._footerLinks().filter(l => l.isConfigured && !!l.url);
    return configured.length > 0
      ? configured.sort((a, b) => a.displayOrder - b.displayOrder)
      : FALLBACK_FOOTER_LINKS;
  });

  readonly copyrightLine = computed(() => {
    const year = new Date().getFullYear();
    const name = this._identity()?.fullName ?? 'Kareem Zarif';
    const title = this._identity()?.professionalTitle ?? '.NET Full Stack Developer';
    return `© ${year} ${name} — ${title}`;
  });
}
