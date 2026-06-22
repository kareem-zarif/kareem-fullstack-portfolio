import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { AuthSessionService } from '@core/auth/auth-session.service';

@Component({
  selector: 'app-auth-callout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="auth-callout">
      <p class="auth-callout__eyebrow">Admin workspace</p>
      <h3>{{ title() }}</h3>
      <p>{{ description() }}</p>
      <button type="button" class="auth-callout__button" (click)="login()">
        {{ session.isAuthenticated ? 'Open Dashboard' : actionLabel() }}
      </button>
    </aside>
  `,
  styles: [
    `
      .auth-callout {
        display: grid;
        gap: 0.85rem;
        padding: 1.4rem;
        border-radius: 1.25rem;
        background: linear-gradient(135deg, #113556 0%, #1f5f87 100%);
        color: #f7fbff;
      }

      .auth-callout__eyebrow {
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.8rem;
        opacity: 0.72;
      }

      h3,
      p {
        margin: 0;
      }

      .auth-callout__button {
        width: fit-content;
        border: 0;
        border-radius: 999px;
        padding: 0.8rem 1.15rem;
        font-weight: 600;
        background: #f7fbff;
        color: #123252;
      }
    `,
  ],
})
export class AuthCalloutComponent {
  readonly session = inject(AuthSessionService);
  readonly title = input('Manage portfolio operations');
  readonly description = input(
    'Securely access the dashboard to review portfolio content, update skills, and triage inbound messages.',
  );
  readonly actionLabel = input('Admin Login');

  login(): void {
    if (this.session.isAuthenticated) {
      this.session.openAdmin();
      return;
    }

    this.session.login();
  }
}
