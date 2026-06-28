import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PublicThemeService } from '@core/services/public-theme.service';
import { PortfolioHomePageApiService } from '@features/portfolio/services/portfolio-home-page-api.service';
import {
  PublicContactApiService,
  PublicContactSubmissionResult,
} from '@features/portfolio/services/public-contact-api.service';
import { SiteSettingsService } from '@features/portfolio/services/site-settings.service';
import { getPortfolioCopy } from '@localization/index';
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
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div></div>`,
  styles: [],
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
