import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ContactMessagesService } from '@features/portfolio/services/contact-messages.service';
import { SiteSettingsService } from '@features/portfolio/services/site-settings.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { SectionHeaderComponent } from '@shared/molecules/section-header.component';
import { contactFormValidators, noDisposableEmailValidator } from '@shared/validators/contact-form.validators';
import { ContactMessage, SiteSetting } from '@shared/models';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SectionHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="contact">
      <div class="contact__surface">
        <app-section-header
          eyebrow="Contact"
          title="Start with a clear product conversation"
          description="The form already targets a dedicated message service, so later backend integration can focus on transport and validation rather than page refactoring."
        />

        <form class="contact__form" [formGroup]="form" (ngSubmit)="submit()">
          <input type="text" placeholder="Your name" formControlName="name" />
          <input type="email" placeholder="Work email" formControlName="email" />
          <input type="text" placeholder="Subject" formControlName="subject" />
          <textarea rows="7" placeholder="Project scope, role, or problem to solve" formControlName="message"></textarea>
          <button type="submit" [disabled]="form.invalid || isSubmitting()">Send message</button>
        </form>

        @if (submittedMessage(); as submitted) {
          <p class="contact__success">
            Message queued for review from {{ submitted.email }} with status {{ submitted.status }}.
          </p>
        }
      </div>

      <aside class="contact__surface contact__details">
        <h3>Direct details</h3>
        @for (setting of settings(); track setting.id) {
          <div class="contact__detail-row">
            <strong>{{ setting.label }}</strong>
            <span>{{ setting.value }}</span>
          </div>
        }
      </aside>
    </section>
  `,
  styles: [
    `
      .contact {
        display: grid;
        grid-template-columns: 1.35fr minmax(280px, 0.8fr);
        gap: 1rem;
      }

      .contact__surface {
        display: grid;
        gap: 1.2rem;
        padding: 1.4rem;
        border-radius: 1.4rem;
        background: rgba(255, 255, 255, 0.92);
        border: 1px solid rgba(17, 50, 80, 0.08);
      }

      .contact__form {
        display: grid;
        gap: 0.85rem;
      }

      input,
      textarea {
        width: 100%;
        border: 1px solid #cfdae6;
        border-radius: 1rem;
        padding: 0.95rem 1rem;
        background: #f9fbfd;
      }

      button {
        width: fit-content;
        border: 0;
        border-radius: 999px;
        padding: 0.9rem 1.1rem;
        background: #123b5c;
        color: white;
        font-weight: 600;
      }

      button:disabled {
        opacity: 0.55;
      }

      .contact__success {
        margin: 0;
        color: #0f6b3d;
        font-weight: 600;
      }

      .contact__details h3 {
        margin: 0;
        color: #132238;
      }

      .contact__detail-row {
        display: grid;
        gap: 0.25rem;
        padding-bottom: 0.85rem;
        border-bottom: 1px solid #e8eef4;
      }

      .contact__detail-row strong {
        color: #132238;
      }

      .contact__detail-row span {
        color: #5f7088;
      }

      @media (max-width: 980px) {
        .contact {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ContactPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly messagesService = inject(ContactMessagesService);

  readonly settings = toSignal(inject(SiteSettingsService).getSiteSettings(), {
    initialValue: [] as SiteSetting[],
  });
  readonly isSubmitting = signal(false);
  readonly submittedMessage = signal<ContactMessage | null>(null);
  readonly form = this.fb.nonNullable.group({
    name: ['', contactFormValidators.name],
    email: ['', [...contactFormValidators.email, noDisposableEmailValidator]],
    subject: ['', contactFormValidators.subject],
    message: ['', contactFormValidators.message],
  });

  submit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.messagesService.submitMessage(this.form.getRawValue()).subscribe(message => {
      this.submittedMessage.set(message);
      this.form.reset({ name: '', email: '', subject: '', message: '' });
      this.isSubmitting.set(false);
    });
  }
}
