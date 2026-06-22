import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PublicThemeService } from '@core/services/public-theme.service';
import { PortfolioHomePageApiService } from '@features/portfolio/services/portfolio-home-page-api.service';
import {
  PublicContactApiService,
  PublicContactSubmissionResult,
} from '@features/portfolio/services/public-contact-api.service';
import { SiteSettingsService } from '@features/portfolio/services/site-settings.service';
import { getPortfolioCopy } from '@localization/index';
import { SectionHeaderComponent } from '@shared/molecules/section-header.component';
import { SiteSetting } from '@shared/models';
import { contactFormValidators, noDisposableEmailValidator } from '@shared/validators/contact-form.validators';
import { catchError, finalize, of, switchMap } from 'rxjs';

interface ContactMetric {
  value: string;
  label: string;
}

interface ContactPromise {
  title: string;
  description: string;
}

interface ContactStep {
  title: string;
  description: string;
}

type ContactFieldName = 'name' | 'email' | 'subject' | 'message';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SectionHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="contact-page">
      <section class="surface contact-hero" aria-labelledby="contact-page-title">
        <div class="contact-hero__copy">
          <p class="story-badge">{{ copy().storyBadge }}</p>
          <p class="eyebrow">{{ copy().eyebrow }}</p>
          <h1 id="contact-page-title">{{ copy().title }}</h1>
          <p class="hero-summary">{{ copy().summary }}</p>

          <div class="signal-list" [attr.aria-label]="copy().signalsLabel">
            <span>{{ copy().signalValidation }}</span>
            <span>{{ copy().signalRealData }}</span>
            <span>{{ copy().signalTheme }}</span>
            <span>{{ copy().signalBilingual }}</span>
          </div>

          <div class="hero-actions">
            <a class="button button--primary" href="#contact-form">{{ copy().scrollToForm }}</a>
            <a class="button button--secondary" routerLink="/projects">{{ copy().viewProjects }}</a>
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

        <article class="surface hero-panel">
          <p class="eyebrow">{{ copy().storyEyebrow }}</p>
          <h2>{{ copy().storyTitle }}</h2>
          <p class="hero-panel__summary">{{ copy().storyDescription }}</p>

          <div class="promise-list">
            @for (promise of promiseCards(); track promise.title) {
              <article class="promise-card">
                <h3>{{ promise.title }}</h3>
                <p>{{ promise.description }}</p>
              </article>
            }
          </div>

          <div class="endpoint-list">
            <div class="endpoint-card">
              <span class="endpoint-method endpoint-method--get">GET</span>
              <strong>/api/site-settings</strong>
              <small>{{ copy().siteSettingsEndpointSummary }}</small>
            </div>

            <div class="endpoint-card">
              <span class="endpoint-method endpoint-method--post">POST</span>
              <strong>/api/contact</strong>
              <small>{{ copy().contactEndpointSummary }}</small>
            </div>
          </div>
        </article>
      </section>

      <section class="contact-content">
        <div class="surface contact-form-card" id="contact-form">
          <app-section-header
            [eyebrow]="copy().formEyebrow"
            [title]="copy().formTitle"
            [description]="copy().formDescription"
          />

          <div class="form-meta">
            <span class="meta-pill">{{ copy().requiredLegend }}</span>
            <span class="meta-pill meta-pill--muted">{{ copy().optionalLegend }}</span>
          </div>

          <form class="contact-form" [formGroup]="form" (ngSubmit)="submit()" [attr.aria-busy]="isSubmitting()">
            <div class="contact-grid">
              <label class="field">
                <div class="field__header">
                  <span>{{ copy().nameLabel }}</span>
                  <small>{{ form.controls.name.value.length }}/80</small>
                </div>
                <input
                  type="text"
                  formControlName="name"
                  dir="auto"
                  autocomplete="name"
                  maxlength="80"
                  [placeholder]="copy().namePlaceholder"
                />
                @if (fieldError('name'); as error) {
                  <small class="field__error">{{ error }}</small>
                }
              </label>

              <label class="field">
                <div class="field__header">
                  <span>{{ copy().emailLabel }}</span>
                  <small>{{ copy().requiredLegend }}</small>
                </div>
                <input
                  type="email"
                  formControlName="email"
                  dir="ltr"
                  autocomplete="email"
                  maxlength="120"
                  inputmode="email"
                  [placeholder]="copy().emailPlaceholder"
                />
                @if (fieldError('email'); as error) {
                  <small class="field__error">{{ error }}</small>
                }
              </label>
            </div>

            <div class="contact-grid">
              <label class="field">
                <div class="field__header">
                  <span>{{ copy().companyLabel }}</span>
                  <small>{{ copy().optionalLegend }}</small>
                </div>
                <input
                  type="text"
                  formControlName="company"
                  dir="auto"
                  autocomplete="organization"
                  maxlength="120"
                  [placeholder]="copy().companyPlaceholder"
                />
              </label>

              <label class="field">
                <div class="field__header">
                  <span>{{ copy().subjectLabel }}</span>
                  <small>{{ form.controls.subject.value.length }}/120</small>
                </div>
                <input
                  type="text"
                  formControlName="subject"
                  dir="auto"
                  autocomplete="off"
                  maxlength="120"
                  [placeholder]="copy().subjectPlaceholder"
                />
                @if (fieldError('subject'); as error) {
                  <small class="field__error">{{ error }}</small>
                }
              </label>
            </div>

            <label class="field">
              <div class="field__header">
                <span>{{ copy().messageLabel }}</span>
                <small>{{ form.controls.message.value.length }}/2000</small>
              </div>
              <textarea
                rows="7"
                formControlName="message"
                dir="auto"
                autocomplete="off"
                maxlength="2000"
                [placeholder]="copy().messagePlaceholder"
              ></textarea>
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

            <div class="contact-actions">
              <button type="submit" class="button button--primary" [disabled]="form.invalid || isSubmitting()">
                @if (isSubmitting()) {
                  <span class="button__pulse" aria-hidden="true"></span>
                }
                <span>{{ isSubmitting() ? copy().submitting : copy().submit }}</span>
              </button>

              <p class="backend-note">{{ copy().backendNote }}</p>
            </div>
          </form>

          @if (submissionError(); as error) {
            <div class="feedback feedback--error" role="alert">
              <strong>{{ copy().errorTitle }}</strong>
              <p>{{ error || copy().errorDescription }}</p>
            </div>
          }

          @if (submittedResult(); as submitted) {
            <div class="feedback feedback--success" role="status" aria-live="polite">
              <strong>{{ copy().successTitle }}</strong>
              <p>{{ copy().successDescription }}</p>
              <p>
                {{ copy().successReferenceLabel }}
                <span>{{ submitted.submissionId }}</span>
              </p>
              <p>
                {{ copy().successTimestampLabel }}
                <span>{{ submitted.submittedAtUtc | date: 'medium' }}</span>
              </p>
            </div>
          }
        </div>

        <aside class="contact-aside">
          <article class="surface aside-card">
            <app-section-header
              [eyebrow]="copy().processEyebrow"
              [title]="copy().processTitle"
              [description]="copy().processDescription"
            />

            <div class="process-list">
              @for (step of processSteps(); track step.title; let index = $index) {
                <article class="process-item">
                  <span class="process-item__index">{{ index + 1 }}</span>
                  <div>
                    <h3>{{ step.title }}</h3>
                    <p>{{ step.description }}</p>
                  </div>
                </article>
              }
            </div>
          </article>

          <article class="surface aside-card">
            <app-section-header
              [eyebrow]="copy().linksEyebrow"
              [title]="copy().linksTitle"
              [description]="copy().linksDescription"
            />

            @if (professionalLinks().length) {
              <div class="link-list">
                @for (link of professionalLinks(); track link.url) {
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
            <app-section-header
              [eyebrow]="copy().settingsEyebrow"
              [title]="copy().settingsTitle"
              [description]="copy().settingsDescription"
            />

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
        backdrop-filter: blur(14px);
      }

      .contact-hero {
        position: relative;
        display: grid;
        grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
        gap: 1.2rem;
        padding: clamp(1.25rem, 3vw, 2rem);
        overflow: hidden;
        isolation: isolate;
      }

      .contact-hero::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--portfolio-accent) 14%, transparent), transparent 34%),
          linear-gradient(140deg, color-mix(in srgb, var(--portfolio-primary) 8%, transparent), transparent 62%);
        pointer-events: none;
        z-index: 0;
      }

      .contact-hero::after {
        content: '';
        position: absolute;
        inset: 1rem;
        border-radius: 1.6rem;
        border: 1px solid color-mix(in srgb, var(--portfolio-border) 82%, transparent);
        background:
          linear-gradient(transparent 95%, color-mix(in srgb, var(--portfolio-border) 50%, transparent) 95%),
          linear-gradient(90deg, transparent 95%, color-mix(in srgb, var(--portfolio-border) 50%, transparent) 95%);
        background-size: 1.2rem 1.2rem;
        opacity: 0.24;
        pointer-events: none;
        z-index: 0;
      }

      .contact-hero__copy,
      .hero-panel,
      .contact-form-card,
      .aside-card {
        position: relative;
        z-index: 1;
      }

      .contact-hero__copy,
      .hero-panel,
      .contact-form-card,
      .aside-card,
      .promise-list,
      .metrics-grid,
      .process-list,
      .link-list,
      .setting-list {
        display: grid;
        gap: 1rem;
      }

      .story-badge,
      .eyebrow {
        margin: 0;
        width: fit-content;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .story-badge {
        padding: 0.45rem 0.85rem;
        background: color-mix(in srgb, var(--portfolio-accent) 14%, transparent);
        color: var(--portfolio-accent);
        border: 1px solid color-mix(in srgb, var(--portfolio-accent) 28%, var(--portfolio-border));
      }

      .eyebrow {
        color: var(--portfolio-primary);
      }

      h1,
      h2,
      h3,
      p,
      dl,
      dd,
      dt,
      strong,
      small {
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
        font-size: clamp(2.2rem, 5vw, 4.4rem);
        line-height: 0.98;
        letter-spacing: -0.04em;
      }

      h2 {
        font-size: clamp(1.5rem, 3vw, 2.2rem);
      }

      .hero-summary,
      .hero-panel__summary,
      .backend-note,
      .empty-copy,
      .promise-card p,
      .endpoint-card small,
      .process-item p,
      .link-card strong,
      .setting-card p,
      .setting-card span,
      .field__header small {
        color: var(--portfolio-muted);
      }

      .signal-list,
      .hero-actions,
      .form-meta,
      .contact-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        align-items: center;
      }

      .signal-list span,
      .meta-pill,
      .endpoint-method {
        width: fit-content;
        border-radius: 999px;
        padding: 0.55rem 0.85rem;
        border: 1px solid color-mix(in srgb, var(--portfolio-primary) 24%, var(--portfolio-border));
        background: color-mix(in srgb, var(--portfolio-primary) 9%, transparent);
        color: var(--portfolio-primary);
        font-size: 0.82rem;
        font-weight: 700;
      }

      .meta-pill--muted {
        border-color: var(--portfolio-border);
        background: color-mix(in srgb, var(--portfolio-bg-soft) 80%, transparent);
        color: var(--portfolio-muted);
      }

      .metrics-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .metric-card,
      .promise-card,
      .endpoint-card,
      .process-item,
      .link-card,
      .setting-card,
      .feedback {
        padding: 1rem;
        border-radius: 1.35rem;
        border: 1px solid var(--portfolio-border);
        background: color-mix(in srgb, var(--portfolio-bg-soft) 82%, transparent);
      }

      .metric-card dt {
        font-size: clamp(1.35rem, 4vw, 2rem);
        font-weight: 900;
      }

      .metric-card dd {
        margin-top: 0.35rem;
        color: var(--portfolio-muted);
      }

      .hero-panel {
        align-content: start;
        padding: 1.15rem;
      }

      .promise-list {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .promise-card h3,
      .process-item h3 {
        font-size: 1rem;
      }

      .endpoint-list {
        display: grid;
        gap: 0.85rem;
      }

      .endpoint-card {
        display: grid;
        gap: 0.4rem;
      }

      .endpoint-method--post {
        border-color: color-mix(in srgb, var(--portfolio-accent) 28%, var(--portfolio-border));
        background: color-mix(in srgb, var(--portfolio-accent) 12%, transparent);
        color: var(--portfolio-accent);
      }

      .contact-content {
        display: grid;
        grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.8fr);
        gap: 1.5rem;
        align-items: start;
      }

      .contact-form-card,
      .aside-card {
        padding: clamp(1.15rem, 3vw, 1.7rem);
      }

      .contact-form-card {
        scroll-margin-top: 7rem;
      }

      .contact-form,
      .contact-grid,
      .field {
        display: grid;
        gap: 1rem;
      }

      .contact-form {
        position: relative;
      }

      .contact-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .field {
        gap: 0.5rem;
      }

      .field__header {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        align-items: baseline;
      }

      .field__header span {
        color: var(--portfolio-text);
        font-weight: 700;
      }

      input,
      textarea {
        width: 100%;
        border-radius: 1.1rem;
        border: 1px solid var(--portfolio-border);
        padding: 0.98rem 1rem;
        background: color-mix(in srgb, var(--portfolio-bg) 74%, transparent);
        color: var(--portfolio-text);
        transition:
          border-color 180ms ease,
          box-shadow 180ms ease,
          transform 180ms ease,
          background 180ms ease;
      }

      input::placeholder,
      textarea::placeholder {
        color: color-mix(in srgb, var(--portfolio-muted) 82%, transparent);
      }

      input:focus,
      textarea:focus {
        outline: none;
        transform: translateY(-1px);
        border-color: color-mix(in srgb, var(--portfolio-primary) 40%, var(--portfolio-border));
        box-shadow: 0 0 0 0.24rem color-mix(in srgb, var(--portfolio-primary) 14%, transparent);
        background: color-mix(in srgb, var(--portfolio-bg-elevated) 88%, transparent);
      }

      textarea {
        min-height: 12rem;
        resize: vertical;
      }

      .field__error {
        color: #ca4d55;
        font-weight: 700;
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

      .button {
        border: 0;
        border-radius: 999px;
        min-height: 3.2rem;
        padding: 0.9rem 1.3rem;
        font-weight: 800;
        text-decoration: none;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        gap: 0.65rem;
        cursor: pointer;
        transition:
          transform 180ms ease,
          box-shadow 180ms ease,
          opacity 180ms ease,
          background 180ms ease;
      }

      .button:hover:not(:disabled) {
        transform: translateY(-1px);
      }

      .button:disabled {
        cursor: not-allowed;
        opacity: 0.66;
      }

      .button--primary {
        background: linear-gradient(
          135deg,
          var(--portfolio-primary),
          color-mix(in srgb, var(--portfolio-primary) 66%, var(--portfolio-accent))
        );
        color: var(--portfolio-primary-contrast);
        box-shadow: 0 18px 38px -26px color-mix(in srgb, var(--portfolio-primary) 78%, transparent);
      }

      .button--secondary {
        border: 1px solid var(--portfolio-border);
        background: color-mix(in srgb, var(--portfolio-bg-elevated) 92%, transparent);
        color: var(--portfolio-text);
      }

      .button__pulse {
        width: 0.85rem;
        height: 0.85rem;
        border-radius: 999px;
        background: currentColor;
        box-shadow: 0 0 0 0 color-mix(in srgb, currentColor 24%, transparent);
        animation: button-pulse 1.2s ease-in-out infinite;
      }

      .backend-note {
        max-width: 28rem;
        line-height: 1.6;
      }

      .feedback {
        display: grid;
        gap: 0.45rem;
      }

      .feedback span {
        color: inherit;
        font-weight: 800;
      }

      .feedback--success {
        border-color: color-mix(in srgb, #1a9a69 24%, var(--portfolio-border));
        background: color-mix(in srgb, #1a9a69 11%, transparent);
        color: #1a9a69;
      }

      .feedback--error {
        border-color: color-mix(in srgb, #ca4d55 22%, var(--portfolio-border));
        background: color-mix(in srgb, #ca4d55 9%, transparent);
        color: #ca4d55;
      }

      .contact-aside {
        display: grid;
        gap: 1.5rem;
      }

      .process-item {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.9rem;
        align-items: start;
      }

      .process-item__index {
        inline-size: 2rem;
        block-size: 2rem;
        border-radius: 999px;
        display: inline-grid;
        place-items: center;
        background: linear-gradient(
          135deg,
          var(--portfolio-primary),
          color-mix(in srgb, var(--portfolio-primary) 72%, var(--portfolio-accent))
        );
        color: var(--portfolio-primary-contrast);
        font-weight: 800;
      }

      .link-card,
      .setting-card {
        text-decoration: none;
        transition:
          transform 180ms ease,
          border-color 180ms ease,
          background 180ms ease;
      }

      .link-card:hover,
      .setting-card:hover,
      .promise-card:hover,
      .metric-card:hover,
      .process-item:hover,
      .endpoint-card:hover {
        transform: translateY(-2px);
        border-color: color-mix(in srgb, var(--portfolio-primary) 28%, var(--portfolio-border));
        background: color-mix(in srgb, var(--portfolio-primary) 9%, transparent);
      }

      .link-card span,
      .setting-card small {
        color: var(--portfolio-accent);
        font-weight: 700;
      }

      .setting-card span {
        font-size: 0.8rem;
        word-break: break-word;
      }

      @media (prefers-reduced-motion: no-preference) {
        .contact-hero,
        .contact-form-card,
        .aside-card {
          animation: lift-in 420ms ease both;
        }

        .metric-card,
        .promise-card,
        .process-item,
        .link-card,
        .setting-card,
        .endpoint-card {
          animation: lift-in 520ms ease both;
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

      @media (max-width: 1180px) {
        .contact-hero,
        .contact-content,
        .promise-list {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 900px) {
        .metrics-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 720px) {
        .contact-grid,
        .metrics-grid {
          grid-template-columns: 1fr;
        }

        .field__header,
        .contact-actions {
          align-items: start;
          flex-direction: column;
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
      .filter(setting => setting.valueType !== 4 && setting.value.trim().length > 0)
      .slice(0, 3),
  );
  readonly metrics = computed<ContactMetric[]>(() => [
    { value: '05', label: this.copy().metricFields },
    { value: '04', label: this.copy().metricRequired },
    { value: this.formatMetric(this.professionalLinks().length), label: this.copy().metricLinks },
    { value: '02', label: this.copy().metricEndpoints },
  ]);
  readonly promiseCards = computed<ContactPromise[]>(() => [
    {
      title: this.copy().promiseValidationTitle,
      description: this.copy().promiseValidationDescription,
    },
    {
      title: this.copy().promiseStorageTitle,
      description: this.copy().promiseStorageDescription,
    },
    {
      title: this.copy().promiseSpamTitle,
      description: this.copy().promiseSpamDescription,
    },
  ]);
  readonly processSteps = computed<ContactStep[]>(() => [
    {
      title: this.copy().processStepCaptureTitle,
      description: this.copy().processStepCaptureDescription,
    },
    {
      title: this.copy().processStepReviewTitle,
      description: this.copy().processStepReviewDescription,
    },
    {
      title: this.copy().processStepResponseTitle,
      description: this.copy().processStepResponseDescription,
    },
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
    this.submittedResult.set(null);

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

  fieldError(controlName: ContactFieldName): string | null {
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
