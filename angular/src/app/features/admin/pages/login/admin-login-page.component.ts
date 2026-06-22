import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthSessionService } from '@core/auth/auth-session.service';
import { getPortfolioCopy } from '@localization/index';
import { PublicThemeService } from '@core/services/public-theme.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-admin-login-page',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="login-shell"
      [attr.data-theme]="theme.theme()"
      [attr.dir]="theme.direction()"
      [attr.lang]="theme.language()"
    >
      <div class="login-shell__card">
        <div class="login-shell__copy">
          <p>{{ copy().eyebrow }}</p>
          <h1>{{ copy().title }}</h1>
          <span>{{ copy().description }}</span>

          <div class="login-shell__actions">
            <button type="button" class="login-shell__primary" (click)="continue()">
              {{ session.isAuthenticated ? copy().dashboardAction : copy().primaryAction }}
            </button>
            <a routerLink="/" class="login-shell__secondary">{{ copy().backHome }}</a>
          </div>
        </div>

        <aside class="login-shell__panel">
          <strong>{{ copy().securityTitle }}</strong>
          <div class="login-shell__points">
            @for (point of copy().securityPoints; track point) {
              <div>
                <span></span>
                <p>{{ point }}</p>
              </div>
            }
          </div>
        </aside>
      </div>
    </section>
  `,
  styles: [
    `
      .login-shell {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 1.25rem;
        --login-bg: #f5f7fb;
        --login-panel: rgba(255, 255, 255, 0.82);
        --login-soft: rgba(237, 242, 248, 0.9);
        --login-text: #12243a;
        --login-muted: #667a93;
        --login-border: rgba(18, 36, 58, 0.12);
        --login-primary: #103c65;
        --login-primary-contrast: #ffffff;
        --login-accent: #ff935a;
        --login-shadow: 0 28px 90px -48px rgba(12, 34, 56, 0.22);
        background:
          radial-gradient(circle at top left, rgba(16, 60, 101, 0.16), transparent 24%),
          radial-gradient(circle at right 20%, rgba(255, 147, 90, 0.18), transparent 24%),
          linear-gradient(180deg, #f7f9fc 0%, var(--login-bg) 100%);
      }

      .login-shell[data-theme='dark'] {
        --login-bg: #07131f;
        --login-panel: rgba(10, 19, 30, 0.84);
        --login-soft: rgba(14, 27, 42, 0.88);
        --login-text: #ecf4ff;
        --login-muted: #9cb2cb;
        --login-border: rgba(191, 214, 235, 0.14);
        --login-primary: #8ecaf7;
        --login-primary-contrast: #07131f;
        --login-accent: #ffbe8d;
        --login-shadow: 0 28px 100px -52px rgba(0, 0, 0, 0.7);
        background:
          radial-gradient(circle at top left, rgba(142, 202, 247, 0.18), transparent 24%),
          radial-gradient(circle at right 20%, rgba(255, 190, 141, 0.16), transparent 24%),
          linear-gradient(180deg, #07131f 0%, #081726 100%);
      }

      .login-shell__card {
        width: min(100%, 1100px);
        display: grid;
        grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
        gap: 1rem;
      }

      .login-shell__copy,
      .login-shell__panel {
        border: 1px solid var(--login-border);
        border-radius: 1.8rem;
        background: color-mix(in srgb, var(--login-panel) 92%, transparent);
        box-shadow: var(--login-shadow);
        backdrop-filter: blur(18px);
        padding: clamp(1.5rem, 4vw, 3rem);
      }

      .login-shell__copy {
        display: grid;
        align-content: center;
        gap: 1rem;
      }

      .login-shell__copy p,
      .login-shell__copy h1,
      .login-shell__copy span,
      .login-shell__panel strong {
        margin: 0;
      }

      .login-shell__copy p {
        color: var(--login-accent);
        font-size: 0.8rem;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      .login-shell__copy h1,
      .login-shell__panel strong {
        color: var(--login-text);
      }

      .login-shell__copy h1 {
        font-size: clamp(2rem, 4vw, 3.5rem);
        line-height: 1.05;
      }

      .login-shell__copy span,
      .login-shell__panel p {
        color: var(--login-muted);
        line-height: 1.75;
      }

      .login-shell__actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
        margin-top: 0.5rem;
      }

      .login-shell__primary,
      .login-shell__secondary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 3rem;
        border-radius: 999px;
        padding: 0.82rem 1.1rem;
        text-decoration: none;
        font-weight: 700;
      }

      .login-shell__primary {
        border: 1px solid transparent;
        background: linear-gradient(135deg, var(--login-primary), var(--login-accent));
        color: var(--login-primary-contrast);
      }

      .login-shell__secondary {
        border: 1px solid var(--login-border);
        color: var(--login-text);
      }

      .login-shell__panel {
        display: grid;
        gap: 1rem;
        background:
          linear-gradient(180deg, color-mix(in srgb, var(--login-soft) 96%, transparent), color-mix(in srgb, var(--login-panel) 92%, transparent));
      }

      .login-shell__points {
        display: grid;
        gap: 0.9rem;
      }

      .login-shell__points div {
        display: grid;
        grid-template-columns: 0.9rem 1fr;
        gap: 0.75rem;
        align-items: start;
      }

      .login-shell__points span {
        width: 0.9rem;
        height: 0.9rem;
        border-radius: 999px;
        background: linear-gradient(135deg, var(--login-primary), var(--login-accent));
        margin-top: 0.45rem;
      }

      .login-shell__points p {
        margin: 0;
      }

      @media (max-width: 900px) {
        .login-shell__card {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 640px) {
        .login-shell__actions {
          display: grid;
        }
      }
    `,
  ],
})
export class AdminLoginPageComponent {
  readonly session = inject(AuthSessionService);
  readonly theme = inject(PublicThemeService);
  readonly copy = computed(() => getPortfolioCopy(this.theme.language(), 'adminLoginPage'));
  private readonly router = inject(Router);
  private readonly returnUrl = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(map(params => params.get('returnUrl') || '/admin/dashboard')),
    { initialValue: '/admin/dashboard' },
  );

  constructor() {
    effect(() => {
      if (this.session.isAuthenticated) {
        void this.router.navigateByUrl(this.returnUrl());
      }
    });
  }

  continue(): void {
    if (this.session.isAuthenticated) {
      void this.router.navigateByUrl(this.returnUrl());
      return;
    }

    this.session.login(this.returnUrl());
  }
}
