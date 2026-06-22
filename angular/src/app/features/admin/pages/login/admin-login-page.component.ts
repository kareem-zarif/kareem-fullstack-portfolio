import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthSessionService } from '@core/auth/auth-session.service';
import { getPortfolioCopy } from '@localization/index';
import { PublicThemeService } from '@core/services/public-theme.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="admin-auth"
      [attr.data-theme]="theme.theme()"
      [attr.dir]="theme.direction()"
      [attr.lang]="theme.language()"
    >
      <div class="admin-auth__orb admin-auth__orb--primary"></div>
      <div class="admin-auth__orb admin-auth__orb--accent"></div>

      <div class="admin-auth__frame">
        <header class="admin-auth__utility">
          <a routerLink="/" class="admin-auth__brand">
            <span>KZ</span>
            <div>
              <strong>Kareem Zarif</strong>
              <small>{{ copy().brandCaption }}</small>
            </div>
          </a>

          <div class="admin-auth__utility-actions">
            <button type="button" class="admin-auth__utility-button" (click)="theme.toggleLanguage()">
              {{ copy().languageToggle }}
            </button>
            <button type="button" class="admin-auth__utility-button" (click)="theme.toggleTheme()">
              {{ theme.isDark() ? copy().switchToLight : copy().switchToDark }}
            </button>
          </div>
        </header>

        <div class="admin-auth__layout">
          <article class="admin-auth__story">
            <p class="admin-auth__eyebrow">{{ copy().eyebrow }}</p>
            <h1>{{ copy().title }}</h1>
            <p class="admin-auth__summary">{{ copy().description }}</p>

            <div class="admin-auth__metrics" aria-label="Story metrics">
              <article>
                <span>{{ copy().storyMetricLabel }}</span>
                <strong>{{ copy().storyMetricValue }}</strong>
              </article>
              <article>
                <span>{{ copy().authMetricLabel }}</span>
                <strong>{{ copy().authMetricValue }}</strong>
              </article>
              <article>
                <span>{{ copy().experienceMetricLabel }}</span>
                <strong>{{ copy().experienceMetricValue }}</strong>
              </article>
            </div>

            <section class="admin-auth__proof">
              <div>
                <p class="admin-auth__section-label">{{ copy().highlightsTitle }}</p>
                <div class="admin-auth__chips">
                  @for (highlight of copy().highlights; track highlight) {
                    <span>{{ highlight }}</span>
                  }
                </div>
              </div>

              <div>
                <p class="admin-auth__section-label">{{ copy().securityTitle }}</p>
                <div class="admin-auth__points">
                  @for (point of copy().securityPoints; track point) {
                    <article>
                      <span></span>
                      <p>{{ point }}</p>
                    </article>
                  }
                </div>
              </div>
            </section>
          </article>

          <section class="admin-auth__form-card">
            <div class="admin-auth__form-copy">
              <p class="admin-auth__eyebrow">{{ copy().formEyebrow }}</p>
              <h2>{{ copy().formTitle }}</h2>
              <p>{{ copy().formDescription }}</p>
            </div>

            <form class="admin-auth__form" [formGroup]="form" (ngSubmit)="submit()">
              <label class="admin-auth__field">
                <span>{{ copy().userNameLabel }}</span>
                <input
                  type="text"
                  formControlName="userNameOrEmailAddress"
                  [placeholder]="copy().userNamePlaceholder"
                  autocomplete="username"
                />
                @if (userNameError()) {
                  <small>{{ userNameError() }}</small>
                }
              </label>

              <label class="admin-auth__field">
                <span>{{ copy().passwordLabel }}</span>
                <div class="admin-auth__password">
                  <input
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    [placeholder]="copy().passwordPlaceholder"
                    autocomplete="current-password"
                  />
                  <button type="button" class="admin-auth__field-toggle" (click)="togglePassword()">
                    {{ showPassword() ? copy().hidePassword : copy().showPassword }}
                  </button>
                </div>
                @if (passwordError()) {
                  <small>{{ passwordError() }}</small>
                }
              </label>

              @if (errorMessage()) {
                <div class="admin-auth__error" role="alert">
                  <strong>{{ copy().errorTitle }}</strong>
                  <p>{{ errorMessage() }}</p>
                </div>
              }

              <div class="admin-auth__actions">
                <button type="submit" class="admin-auth__submit" [disabled]="isSubmitting()">
                  {{ isSubmitting() ? copy().submitting : copy().submit }}
                </button>
                <a routerLink="/" class="admin-auth__secondary">{{ copy().backHome }}</a>
              </div>
            </form>

            <div class="admin-auth__footnote">
              <strong>{{ copy().endpointNoteTitle }}</strong>
              <p>{{ copy().endpointNote }}</p>
            </div>
          </section>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .admin-auth {
        min-height: 100vh;
        position: relative;
        isolation: isolate;
        overflow: clip;
        padding: clamp(1rem, 3vw, 1.5rem);
        --admin-auth-bg: #f4f7fb;
        --admin-auth-panel: rgba(255, 255, 255, 0.78);
        --admin-auth-panel-soft: rgba(236, 242, 248, 0.9);
        --admin-auth-text: #11253c;
        --admin-auth-muted: #60748f;
        --admin-auth-border: rgba(17, 37, 60, 0.12);
        --admin-auth-primary: #103c65;
        --admin-auth-primary-contrast: #ffffff;
        --admin-auth-accent: #f39c67;
        --admin-auth-shadow: 0 28px 80px -44px rgba(12, 34, 56, 0.24);
        background:
          radial-gradient(circle at top left, rgba(16, 60, 101, 0.18), transparent 26%),
          radial-gradient(circle at bottom right, rgba(243, 156, 103, 0.22), transparent 24%),
          linear-gradient(180deg, #f9fbfd 0%, var(--admin-auth-bg) 100%);
      }

      .admin-auth[data-theme='dark'] {
        --admin-auth-bg: #07131f;
        --admin-auth-panel: rgba(10, 19, 30, 0.78);
        --admin-auth-panel-soft: rgba(14, 27, 42, 0.9);
        --admin-auth-text: #eef5ff;
        --admin-auth-muted: #9db4cc;
        --admin-auth-border: rgba(191, 214, 235, 0.14);
        --admin-auth-primary: #8ecaf7;
        --admin-auth-primary-contrast: #07131f;
        --admin-auth-accent: #ffbe8d;
        --admin-auth-shadow: 0 30px 90px -46px rgba(0, 0, 0, 0.74);
        background:
          radial-gradient(circle at top left, rgba(142, 202, 247, 0.18), transparent 26%),
          radial-gradient(circle at bottom right, rgba(255, 190, 141, 0.16), transparent 24%),
          linear-gradient(180deg, #07131f 0%, #081726 100%);
      }

      .admin-auth__orb {
        position: absolute;
        border-radius: 999px;
        filter: blur(60px);
        opacity: 0.42;
        pointer-events: none;
        z-index: -1;
        animation: admin-auth-float 9s ease-in-out infinite alternate;
      }

      .admin-auth__orb--primary {
        inset-inline-start: -6rem;
        top: 8rem;
        width: min(24rem, 36vw);
        aspect-ratio: 1;
        background: color-mix(in srgb, var(--admin-auth-primary) 52%, transparent);
      }

      .admin-auth__orb--accent {
        inset-inline-end: -5rem;
        bottom: 5rem;
        width: min(22rem, 30vw);
        aspect-ratio: 1;
        background: color-mix(in srgb, var(--admin-auth-accent) 46%, transparent);
        animation-duration: 11s;
      }

      .admin-auth__frame {
        width: min(100%, 1320px);
        margin-inline: auto;
        display: grid;
        gap: 1.25rem;
      }

      .admin-auth__utility,
      .admin-auth__story,
      .admin-auth__form-card {
        border: 1px solid var(--admin-auth-border);
        box-shadow: var(--admin-auth-shadow);
        backdrop-filter: blur(18px);
      }

      .admin-auth__utility {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: 1rem 1.15rem;
        border-radius: 1.5rem;
        background: color-mix(in srgb, var(--admin-auth-panel) 92%, transparent);
        animation: admin-auth-rise 420ms ease both;
      }

      .admin-auth__brand {
        display: inline-flex;
        align-items: center;
        gap: 0.85rem;
        min-width: 0;
        text-decoration: none;
        color: inherit;
      }

      .admin-auth__brand span {
        width: 3rem;
        height: 3rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 1rem;
        background: linear-gradient(135deg, var(--admin-auth-primary), var(--admin-auth-accent));
        color: var(--admin-auth-primary-contrast);
        font-weight: 800;
        letter-spacing: 0.08em;
      }

      .admin-auth__brand strong,
      .admin-auth__brand small,
      .admin-auth__eyebrow,
      .admin-auth__section-label,
      .admin-auth__summary,
      .admin-auth__form-copy p,
      .admin-auth__field span,
      .admin-auth__field small,
      .admin-auth__error p,
      .admin-auth__footnote p,
      .admin-auth__points p,
      .admin-auth__metrics span {
        margin: 0;
      }

      .admin-auth__brand strong,
      .admin-auth h1,
      .admin-auth h2,
      .admin-auth__metrics strong,
      .admin-auth__error strong,
      .admin-auth__footnote strong {
        color: var(--admin-auth-text);
      }

      .admin-auth__brand small,
      .admin-auth__summary,
      .admin-auth__form-copy p,
      .admin-auth__points p,
      .admin-auth__footnote p,
      .admin-auth__metrics span {
        color: var(--admin-auth-muted);
      }

      .admin-auth__utility-actions,
      .admin-auth__actions {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        flex-wrap: wrap;
      }

      .admin-auth__utility-button,
      .admin-auth__field-toggle,
      .admin-auth__secondary,
      .admin-auth__submit {
        border-radius: 999px;
        font-weight: 700;
        transition:
          transform 180ms ease,
          border-color 180ms ease,
          background 180ms ease,
          opacity 180ms ease;
      }

      .admin-auth__utility-button,
      .admin-auth__field-toggle,
      .admin-auth__secondary {
        border: 1px solid var(--admin-auth-border);
        background: color-mix(in srgb, var(--admin-auth-panel-soft) 86%, transparent);
        color: var(--admin-auth-text);
      }

      .admin-auth__utility-button:hover,
      .admin-auth__field-toggle:hover,
      .admin-auth__secondary:hover,
      .admin-auth__submit:hover {
        transform: translateY(-1px);
      }

      .admin-auth__utility-button {
        min-height: 2.9rem;
        padding: 0.72rem 1rem;
      }

      .admin-auth__layout {
        display: grid;
        grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
        gap: 1.25rem;
      }

      .admin-auth__story,
      .admin-auth__form-card {
        background: color-mix(in srgb, var(--admin-auth-panel) 92%, transparent);
        border-radius: 2rem;
        padding: clamp(1.35rem, 3vw, 2.5rem);
        animation: admin-auth-rise 520ms ease both;
      }

      .admin-auth__story {
        display: grid;
        align-content: start;
        gap: 1.35rem;
      }

      .admin-auth__eyebrow,
      .admin-auth__section-label {
        color: var(--admin-auth-accent);
        text-transform: uppercase;
        letter-spacing: 0.14em;
        font-size: 0.78rem;
        font-weight: 800;
      }

      .admin-auth h1 {
        margin: 0;
        font-size: clamp(2.2rem, 4vw, 4rem);
        line-height: 1.02;
        max-width: 12ch;
      }

      .admin-auth h2 {
        margin: 0;
        font-size: clamp(1.5rem, 3vw, 2.25rem);
      }

      .admin-auth__summary {
        font-size: 1rem;
        line-height: 1.85;
        max-width: 62ch;
      }

      .admin-auth__metrics {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.85rem;
      }

      .admin-auth__metrics article,
      .admin-auth__footnote,
      .admin-auth__error {
        border: 1px solid var(--admin-auth-border);
        border-radius: 1.3rem;
        background: linear-gradient(
          180deg,
          color-mix(in srgb, var(--admin-auth-panel-soft) 94%, transparent),
          color-mix(in srgb, var(--admin-auth-panel) 88%, transparent)
        );
      }

      .admin-auth__metrics article {
        display: grid;
        gap: 0.45rem;
        padding: 1rem;
      }

      .admin-auth__metrics strong {
        font-size: 1.05rem;
      }

      .admin-auth__proof {
        display: grid;
        gap: 1.25rem;
      }

      .admin-auth__chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
      }

      .admin-auth__chips span {
        padding: 0.72rem 0.95rem;
        border-radius: 999px;
        border: 1px solid var(--admin-auth-border);
        background: color-mix(in srgb, var(--admin-auth-panel-soft) 88%, transparent);
        color: var(--admin-auth-text);
        font-weight: 600;
      }

      .admin-auth__points {
        display: grid;
        gap: 0.75rem;
      }

      .admin-auth__points article {
        display: grid;
        grid-template-columns: 0.9rem 1fr;
        gap: 0.8rem;
        align-items: start;
        padding: 1rem;
        border-radius: 1.25rem;
        border: 1px solid var(--admin-auth-border);
        background: color-mix(in srgb, var(--admin-auth-panel-soft) 74%, transparent);
      }

      .admin-auth__points span {
        width: 0.9rem;
        height: 0.9rem;
        margin-top: 0.35rem;
        border-radius: 999px;
        background: linear-gradient(135deg, var(--admin-auth-primary), var(--admin-auth-accent));
      }

      .admin-auth__form-card {
        display: grid;
        gap: 1.25rem;
        animation-delay: 80ms;
      }

      .admin-auth__form-copy {
        display: grid;
        gap: 0.75rem;
      }

      .admin-auth__form {
        display: grid;
        gap: 1rem;
      }

      .admin-auth__field {
        display: grid;
        gap: 0.55rem;
      }

      .admin-auth__field span {
        color: var(--admin-auth-text);
        font-weight: 700;
      }

      .admin-auth__field input {
        width: 100%;
        min-height: 3.35rem;
        padding: 0.92rem 1rem;
        border-radius: 1rem;
        border: 1px solid var(--admin-auth-border);
        background: color-mix(in srgb, var(--admin-auth-panel-soft) 72%, transparent);
        color: var(--admin-auth-text);
        transition:
          border-color 180ms ease,
          box-shadow 180ms ease,
          background 180ms ease;
      }

      .admin-auth__field input::placeholder {
        color: color-mix(in srgb, var(--admin-auth-muted) 86%, transparent);
      }

      .admin-auth__field input:focus {
        outline: none;
        border-color: color-mix(in srgb, var(--admin-auth-primary) 56%, transparent);
        box-shadow: 0 0 0 0.22rem color-mix(in srgb, var(--admin-auth-primary) 16%, transparent);
      }

      .admin-auth__field small {
        color: #cc5637;
        font-size: 0.82rem;
      }

      .admin-auth__password {
        position: relative;
      }

      .admin-auth__password input {
        padding-inline-end: 7rem;
      }

      .admin-auth__field-toggle {
        position: absolute;
        inset-inline-end: 0.5rem;
        top: 50%;
        transform: translateY(-50%);
        min-height: 2.45rem;
        padding: 0.45rem 0.85rem;
      }

      .admin-auth__field-toggle:hover {
        transform: translateY(calc(-50% - 1px));
      }

      .admin-auth__error,
      .admin-auth__footnote {
        display: grid;
        gap: 0.35rem;
        padding: 1rem 1.05rem;
      }

      .admin-auth__error {
        background: linear-gradient(
          180deg,
          color-mix(in srgb, #f38b6a 12%, var(--admin-auth-panel-soft)),
          color-mix(in srgb, #f38b6a 5%, var(--admin-auth-panel))
        );
      }

      .admin-auth__actions {
        margin-top: 0.2rem;
      }

      .admin-auth__submit,
      .admin-auth__secondary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 3.2rem;
        padding: 0.88rem 1.1rem;
        text-decoration: none;
      }

      .admin-auth__submit {
        min-width: 11.5rem;
        border: 1px solid transparent;
        background: linear-gradient(135deg, var(--admin-auth-primary), var(--admin-auth-accent));
        color: var(--admin-auth-primary-contrast);
      }

      .admin-auth__submit:disabled {
        cursor: progress;
        opacity: 0.7;
      }

      .admin-auth__secondary {
        min-width: 8.5rem;
      }

      @media (max-width: 1080px) {
        .admin-auth__layout {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 720px) {
        .admin-auth__utility {
          flex-direction: column;
          align-items: stretch;
        }

        .admin-auth__utility-actions,
        .admin-auth__metrics,
        .admin-auth__actions {
          display: grid;
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 560px) {
        .admin-auth__brand {
          align-items: flex-start;
        }

        .admin-auth__password input {
          padding-inline-end: 1rem;
        }

        .admin-auth__field-toggle {
          position: static;
          transform: none;
          margin-top: 0.65rem;
          width: fit-content;
        }

        .admin-auth__field-toggle:hover {
          transform: translateY(-1px);
        }
      }

      @keyframes admin-auth-rise {
        from {
          opacity: 0;
          transform: translateY(18px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes admin-auth-float {
        from {
          transform: translate3d(0, 0, 0) scale(1);
        }
        to {
          transform: translate3d(0, -14px, 0) scale(1.04);
        }
      }
    `,
  ],
})
export class AdminLoginPageComponent {
  readonly session = inject(AuthSessionService);
  readonly theme = inject(PublicThemeService);
  readonly copy = computed(() => getPortfolioCopy(this.theme.language(), 'adminLoginPage'));
  readonly isSubmitting = signal(false);
  readonly showPassword = signal(false);
  readonly errorMessage = signal('');
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly returnUrl =
    inject(ActivatedRoute).snapshot.queryParamMap.get('returnUrl') || '/admin/dashboard';

  readonly form = this.formBuilder.nonNullable.group({
    userNameOrEmailAddress: ['', [Validators.required, Validators.maxLength(256)]],
    password: ['', [Validators.required]],
  });

  constructor() {
    if (this.session.isAuthenticated) {
      void this.router.navigateByUrl(this.returnUrl);
    }
  }

  userNameError(): string {
    const control = this.form.controls.userNameOrEmailAddress;
    if (!control.touched && !control.dirty) {
      return '';
    }

    if (control.hasError('required')) {
      return this.copy().validationRequired;
    }

    if (control.hasError('maxlength')) {
      return this.copy().validationUserNameMaxLength;
    }

    return this.copy().validationInvalid;
  }

  passwordError(): string {
    const control = this.form.controls.password;
    if (!control.touched && !control.dirty) {
      return '';
    }

    return control.hasError('required') ? this.copy().validationRequired : this.copy().validationInvalid;
  }

  togglePassword(): void {
    this.showPassword.update(value => !value);
  }

  submit(): void {
    if (this.isSubmitting()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.isSubmitting.set(true);

    this.session
      .signIn(this.form.getRawValue(), this.returnUrl)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        error: error => this.errorMessage.set(this.resolveErrorMessage(error)),
      });
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 0) {
      return this.copy().networkError;
    }

    const candidate = error as {
      error?: {
        error?: { message?: string };
        message?: string;
      };
      message?: string;
    };

    return (
      candidate?.error?.error?.message ??
      candidate?.error?.message ??
      candidate?.message ??
      this.copy().errorFallback
    );
  }
}
