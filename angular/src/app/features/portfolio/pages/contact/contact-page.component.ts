import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PublicThemeService } from '@core/services/public-theme.service';
import { getPortfolioCopy } from '@localization/index';
import { PortfolioHomePageApiService } from '@features/portfolio/services/portfolio-home-page-api.service';
import {
  PublicContactApiService,
  PublicContactSubmissionResult,
} from '@features/portfolio/services/public-contact-api.service';
import { SiteSettingsService } from '@features/portfolio/services/site-settings.service';
import { SectionHeaderComponent } from '@shared/molecules/section-header.component';
import { SiteSetting } from '@shared/models';
import { contactFormValidators, noDisposableEmailValidator } from '@shared/validators/contact-form.validators';
import { catchError, finalize, of, switchMap } from 'rxjs';

interface ContactMetric {
  value: string;
  label: string;
}

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SectionHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="contact-page">
      <section class="contact-page__hero surface" aria-labelledby="contact-page-title">
        <div class="hero__copy">
          <p class="eyebrow">{{ copy().eyebrow }}</p>
          <h1 id="contact-page-title">{{ copy().title }}</h1>
          <p class="hero__summary">{{ copy().summary }}</p>

          <div class="hero__signals" [attr.aria-label]="copy().signalsLabel">
            <span>{{ copy().signalValidation }}</span>
            <span>{{ copy().signalRealData }}</span>
            <span>{{ copy().signalTheme }}</span>
          </div>

          <dl class="metrics-grid">
            @for (metric of metrics(); track metric.label) {
              <div class="metric-card">
                <dt>{{ metric.value }}</dt>
                <dd>{{ metric.label }}</dd>
              </div>
            }
          </dl>
        </div>

        <article class="hero__status">
          <p class="eyebrow">{{ copy().statusEyebrow }}</p>
          <h2>{{ copy().statusTitle }}</h2>
          <p>{{ copy().statusDescription }}</p>

          <div class="endpoint-list">
            <div class="endpoint-list__item">
              <span class="endpoint-list__method">GET</span>
              <strong>/api/site-settings</strong>
              <small>{{ copy().siteSettingsEndpointSummary }}</small>
            </div>

            <div class="endpoint-list__item">
              <span class="endpoint-list__method endpoint-list__method--post">POST</span>
              <strong>/api/contact</strong>
              <small>{{ copy().contactEndpointSummary }}</small>
            </div>
          </div>
        </article>
      </section>

      <section class="contact-page__content">
        <div class="contact-page__form surface">
          <app-section-header
            [eyebrow]="copy().formEyebrow"
            [title]="copy().formTitle"
            [description]="copy().formDescription"
          />

          <form class="contact__form" [formGroup]="form" (ngSubmit)="submit()">
            <div class="contact__grid">
              <label class="field">
                <span>{{ copy().nameLabel }}</span>
                <input type="text" [placeholder]="copy().namePlaceholder" formControlName="name" />
                @if (fieldError('name'); as error) {
                  <small class="field__error">{{ error }}</small>
                }
              </label>

              <label class="field">
                <span>{{ copy().emailLabel }}</span>
                <input type="email" [placeholder]="copy().emailPlaceholder" formControlName="email" />
                @if (fieldError('email'); as error) {
                  <small class="field__error">{{ error }}</small>
                }
              </label>
            </div>

            <div class="contact__grid">
              <label class="field">
                <span>{{ copy().companyLabel }}</span>
                <input type="text" [placeholder]="copy().companyPlaceholder" formControlName="company" />
              </label>

              <label class="field">
                <span>{{ copy().subjectLabel }}</span>
                <input type="text" [placeholder]="copy().subjectPlaceholder" formControlName="subject" />
                @if (fieldError('subject'); as error) {
                  <small class="field__error">{{ error }}</small>
                }
              </label>
            </div>

            <label class="field">
              <span>{{ copy().messageLabel }}</span>
              <textarea rows="7" [placeholder]="copy().messagePlaceholder" formControlName="message"></textarea>
              @if (fieldError('message'); as error) {
                <small class="field__error">{{ error }}</small>
              }
            </label>

            <div class="honeypot" aria-hidden="true">
              <label>
                <span>{{ copy().honeypotLabel }}</span>
                <input type="text" tabindex="-1" autocomplete="off" formControlName="honeypot" />
              </label>
            </div>

            <div class="contact__actions">
              <button type="submit" class="button button--primary" [disabled]="form.invalid || isSubmitting()">
                @if (isSubmitting()) {
                  <span class="button__pulse" aria-hidden="true"></span>
                }
                <span>{{ isSubmitting() ? copy().submitting : copy().submit }}</span>
              </button>

              <p class="contact__note">{{ copy().backendNote }}</p>
            </div>
          </form>

          @if (submissionError(); as error) {
            <p class="contact__error" role="alert">{{ error }}</p>
          }

          @if (submittedResult(); as submitted) {
            <p class="contact__success">
              {{ copy().successPrefix }}
              <strong>{{ submitted.submissionId }}</strong>
              {{ copy().successSuffix }}
              <span>{{ submitted.submittedAtUtc | date: 'medium' }}</span>
            </p>
          }
        </div>

        <aside class="contact-page__aside">
          <article class="surface aside-card">
            <p class="eyebrow">{{ copy().linksEyebrow }}</p>
            <h2>{{ copy().linksTitle }}</h2>
            <p>{{ copy().linksDescription }}</p>

            @if (professionalLinks().length) {
              <div class="link-list">
                @for (link of professionalLinks(); track link.displayOrder) {
                  <a
                    class="link-card"
                    [href]="link.url"
                    [attr.target]="link.isExternal ? '_blank' : null"
                    [attr.rel]="link.isExternal ? 'noopener noreferrer' : null"
                  >
                    <span>{{ link.label }}</span>
                    <strong>{{ link.url }}</strong>
                  </a>
                }
              </div>
            } @else {
              <p class="empty-copy">{{ copy().linksEmpty }}</p>
            }
          </article>

          <article class="surface aside-card">
            <p class="eyebrow">{{ copy().settingsEyebrow }}</p>
            <h2>{{ copy().settingsTitle }}</h2>
            <p>{{ copy().settingsDescription }}</p>

            @if (featuredSettings().length) {
              <div class="setting-list">
                @for (setting of featuredSettings(); track setting.key) {
                  <article class="setting-card">
                    <small>{{ setting.valueTypeLabel }}</small>
                    <strong>{{ setting.label }}</strong>
                    <p>{{ setting.value }}</p>
                    <span>{{ setting.key }}</span>
                  </article>
                }
              </div>
            } @else {
              <p class="empty-copy">{{ copy().settingsEmpty }}</p>
            }
          </article>
        </aside>
      </section>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .contact-page {
        display: grid;
        gap: 1.5rem;
      }

      .surface {
        border: 1px solid var(--portfolio-border);
        border-radius: 2rem;
        background: color-mix(in srgb, var(--portfolio-bg-elevated) 94%, transparent);
        box-shadow: var(--portfolio-shadow);
      }

      .contact-page__hero {
        position: relative;
        display: grid;
        grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.85fr);
        gap: 1.2rem;
        padding: clamp(1.3rem, 3vw, 2rem);
        overflow: hidden;
      }

      .contact-page__hero::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at top right, color-mix(in srgb, var(--portfolio-accent) 14%, transparent), transparent 32%),
          linear-gradient(180deg, color-mix(in srgb, var(--portfolio-primary) 8%, transparent), transparent 62%);
        pointer-events: none;
      }

      .hero__copy,
      .hero__status,
      .contact-page__form,
      .aside-card {
        position: relative;
        z-index: 1;
        display: grid;
        gap: 1rem;
      }

      .eyebrow {
        margin: 0;
        color: var(--portfolio-accent);
        font-size: 0.84rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      h1,
      h2,
      h3,
      p,
      strong {
        margin: 0;
      }

      h1,
      h2,
      h3,
      strong {
        color: var(--portfolio-text);
      }

      .hero__summary,
      .contact__note,
      .empty-copy,
      .setting-card p,
      .setting-card span,
      .endpoint-list__item small,
      .contact__success span {
        color: var(--portfolio-muted);
      }

      .hero__signals {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .hero__signals span,
      .endpoint-list__method {
        width: fit-content;
        border-radius: 999px;
        padding: 0.55rem 0.9rem;
        border: 1px solid color-mix(in srgb, var(--portfolio-primary) 24%, var(--portfolio-border));
        background: color-mix(in srgb, var(--portfolio-primary) 9%, transparent);
        color: var(--portfolio-primary);
        font-size: 0.85rem;
        font-weight: 700;
      }

      .endpoint-list {
        display: grid;
        gap: 0.85rem;
      }

      .endpoint-list__item {
        display: grid;
        gap: 0.45rem;
        padding: 1rem;
        border-radius: 1.25rem;
        border: 1px solid var(--portfolio-border);
        background: color-mix(in srgb, var(--portfolio-bg-soft) 80%, transparent);
      }

      .endpoint-list__item strong {
        font-size: 1.05rem;
      }

      .endpoint-list__method--post {
        border-color: color-mix(in srgb, var(--portfolio-accent) 28%, var(--portfolio-border));
        background: color-mix(in srgb, var(--portfolio-accent) 12%, transparent);
        color: var(--portfolio-accent);
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.85rem;
      }

      .metric-card {
        padding: 1rem;
        border-radius: 1.25rem;
        border: 1px solid var(--portfolio-border);
        background: color-mix(in srgb, var(--portfolio-bg-soft) 78%, transparent);
      }

      .metric-card dt {
        color: var(--portfolio-text);
        font-size: clamp(1.4rem, 4vw, 2rem);
        font-weight: 800;
      }

      .metric-card dd {
        margin: 0.35rem 0 0;
        color: var(--portfolio-muted);
      }

      .contact-page__content {
        display: grid;
        grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.85fr);
        gap: 1.5rem;
        align-items: start;
      }

      .contact-page__form,
      .aside-card {
        padding: clamp(1.2rem, 3vw, 1.7rem);
      }

      .contact__form {
        display: grid;
        gap: 1rem;
      }

      .contact__grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
      }

      .field {
        display: grid;
        gap: 0.45rem;
      }

      .field span {
        color: var(--portfolio-text);
        font-weight: 700;
      }

      input,
      textarea {
        width: 100%;
        border-radius: 1rem;
        border: 1px solid var(--portfolio-border);
        padding: 0.95rem 1rem;
        background: color-mix(in srgb, var(--portfolio-bg) 72%, transparent);
        color: var(--portfolio-text);
        transition:
          border-color 180ms ease,
          box-shadow 180ms ease,
          transform 180ms ease;
      }

      input:focus,
      textarea:focus {
        outline: none;
        border-color: color-mix(in srgb, var(--portfolio-primary) 45%, var(--portfolio-border));
        box-shadow: 0 0 0 0.24rem color-mix(in srgb, var(--portfolio-primary) 14%, transparent);
        transform: translateY(-1px);
      }

      textarea {
        min-height: 11rem;
        resize: vertical;
      }

      .field__error,
      .contact__error {
        color: #c94d4d;
        font-weight: 600;
      }

      .honeypot {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        white-space: nowrap;
      }

      .contact__actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 1rem;
        align-items: center;
      }

      .button {
        border: 0;
        border-radius: 999px;
        min-height: 3.2rem;
        padding: 0.9rem 1.25rem;
        font-weight: 800;
        display: inline-flex;
        align-items: center;
        gap: 0.65rem;
        transition:
          transform 180ms ease,
          box-shadow 180ms ease,
          opacity 180ms ease;
      }

      .button:hover:not(:disabled) {
        transform: translateY(-1px);
      }

      .button:disabled {
        opacity: 0.62;
      }

      .button--primary {
        background: linear-gradient(
          135deg,
          var(--portfolio-primary),
          color-mix(in srgb, var(--portfolio-primary) 66%, var(--portfolio-accent))
        );
        color: var(--portfolio-primary-contrast);
        box-shadow: 0 18px 40px -28px color-mix(in srgb, var(--portfolio-primary) 80%, transparent);
      }

      .button__pulse {
        width: 0.85rem;
        height: 0.85rem;
        border-radius: 999px;
        background: currentColor;
        box-shadow: 0 0 0 0 color-mix(in srgb, currentColor 24%, transparent);
        animation: button-pulse 1.2s ease-in-out infinite;
      }

      .contact__success {
        display: flex;
        flex-wrap: wrap;
        gap: 0.85rem;
        align-items: center;
        padding: 1rem 1.1rem;
        border-radius: 1.1rem;
        border: 1px solid color-mix(in srgb, #0f8a55 22%, var(--portfolio-border));
        background: color-mix(in srgb, #0f8a55 10%, transparent);
        color: #0f8a55;
      }

      .contact-page__aside {
        display: grid;
        gap: 1.5rem;
      }

      .link-list,
      .setting-list {
        display: grid;
        gap: 0.85rem;
      }

      .link-card,
      .setting-card {
        display: grid;
        gap: 0.4rem;
        padding: 1rem;
        border-radius: 1.2rem;
        border: 1px solid var(--portfolio-border);
        background: color-mix(in srgb, var(--portfolio-bg-soft) 82%, transparent);
      }

      .link-card {
        text-decoration: none;
        transition:
          transform 180ms ease,
          border-color 180ms ease,
          background 180ms ease;
      }

      .link-card:hover {
        transform: translateY(-1px);
        border-color: color-mix(in srgb, var(--portfolio-primary) 30%, var(--portfolio-border));
        background: color-mix(in srgb, var(--portfolio-primary) 9%, transparent);
      }

      .setting-card small {
        color: var(--portfolio-accent);
        font-weight: 700;
      }

      .setting-card span {
        font-size: 0.82rem;
        word-break: break-word;
      }

      @media (prefers-reduced-motion: no-preference) {
        .contact-page__hero,
        .contact-page__form,
        .aside-card {
          animation: lift-in 420ms ease both;
        }
      }

      @keyframes lift-in {
        from {
          opacity: 0;
          transform: translateY(16px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes button-pulse {
        0% {
          box-shadow: 0 0 0 0 color-mix(in srgb, currentColor 28%, transparent);
        }
        100% {
          box-shadow: 0 0 0 0.55rem color-mix(in srgb, currentColor 0%, transparent);
        }
      }

      @media (max-width: 1080px) {
        .contact-page__hero,
        .contact-page__content {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 720px) {
        .metrics-grid,
        .contact__grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ContactPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly contactApi = inject(PublicContactApiService);
  private readonly homePageApi = inject(PortfolioHomePageApiService);
  private readonly siteSettingsService = inject(SiteSettingsService);

  readonly theme = inject(PublicThemeService);
  readonly copy = computed(() => getPortfolioCopy(this.theme.language(), 'contactPage'));

  private readonly language$ = toObservable(this.theme.language);

  readonly settings = toSignal(
    this.language$.pipe(
      switchMap(() => this.siteSettingsService.getSiteSettings()),
      catchError(() => of([] as SiteSetting[])),
    ),
    { initialValue: [] as SiteSetting[] },
  );
  readonly homePage = toSignal(
    this.language$.pipe(
      switchMap(() => this.homePageApi.getHomePage()),
      catchError(() => of(null)),
    ),
    { initialValue: null },
  );
  readonly isSubmitting = signal(false);
  readonly submissionError = signal<string | null>(null);
  readonly submittedResult = signal<PublicContactSubmissionResult | null>(null);
  readonly professionalLinks = computed(() => this.homePage()?.professionalLinks ?? []);
  readonly featuredSettings = computed(() =>
    this.settings()
      .filter(setting => setting.valueType !== 4)
      .slice(0, 4),
  );
  readonly metrics = computed<ContactMetric[]>(() => [
    { value: this.formatMetric(this.featuredSettings().length), label: this.copy().metricLiveSettings },
    { value: this.formatMetric(this.professionalLinks().length), label: this.copy().metricLinks },
    { value: this.formatMetric(2), label: this.copy().metricEndpoints },
  ]);
  readonly form = this.fb.nonNullable.group({
    name: ['', contactFormValidators.name],
    email: ['', [...contactFormValidators.email, noDisposableEmailValidator]],
    company: [''],
    subject: ['', contactFormValidators.subject],
    message: ['', contactFormValidators.message],
    honeypot: [''],
  });

  submit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submissionError.set(null);

    this.contactApi
      .submitMessage(this.form.getRawValue())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: result => {
          this.submittedResult.set(result);
          this.form.reset({ name: '', email: '', company: '', subject: '', message: '', honeypot: '' });
        },
        error: error => {
          this.submissionError.set(this.extractErrorMessage(error));
        },
      });
  }

  fieldError(controlName: 'name' | 'email' | 'subject' | 'message'): string | null {
    const control = this.form.controls[controlName];

    if (!control.touched || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return this.copy().validationRequired;
    }

    if (control.errors['email']) {
      return this.copy().validationEmail;
    }

    if (control.errors['minlength']) {
      return this.copy().validationMinLength;
    }

    if (control.errors['maxlength']) {
      return this.copy().validationMaxLength;
    }

    if (control.errors['disposableEmail']) {
      return this.copy().validationDisposableEmail;
    }

    return this.copy().validationInvalid;
  }

  private extractErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return this.copy().errorDescription;
    }

    const errorBody = error.error as { message?: string; error?: { message?: string } } | null;
    return errorBody?.error?.message ?? errorBody?.message ?? this.copy().errorDescription;
  }

  private formatMetric(value: number): string {
    return String(value).padStart(2, '0');
  }
}
