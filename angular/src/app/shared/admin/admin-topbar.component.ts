import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { AuthSessionService } from '@core/auth/auth-session.service';

@Component({
  selector: 'app-admin-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="topbar">
      <div>
        <p>Operations overview</p>
        <h1>{{ currentSection() }}</h1>
      </div>
      <div class="topbar__actions">
        <a routerLink="/contact">Preview contact page</a>
        <button type="button" (click)="session.navigateToAccount()">Manage account</button>
      </div>
    </header>
  `,
  styles: [
    `
      .topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #dce5ef;
        background: rgba(255, 255, 255, 0.82);
        backdrop-filter: blur(10px);
        position: sticky;
        top: 0;
        z-index: 4;
      }

      p,
      h1 {
        margin: 0;
      }

      p {
        color: #6f8098;
        text-transform: uppercase;
        font-size: 0.8rem;
        letter-spacing: 0.12em;
      }

      h1 {
        color: #132238;
        font-size: 1.5rem;
      }

      .topbar__actions {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }

      a,
      button {
        border-radius: 999px;
        padding: 0.75rem 1rem;
        border: 1px solid #d7e1ec;
        background: #fff;
        text-decoration: none;
        color: #163f62;
        font-weight: 600;
      }

      @media (max-width: 900px) {
        .topbar {
          flex-direction: column;
          align-items: start;
        }
      }
    `,
  ],
})
export class AdminTopbarComponent {
  readonly session = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly routeLabel = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.formatSection(this.router.url)),
      startWith(this.formatSection(this.router.url)),
    ),
    { initialValue: this.formatSection(this.router.url) },
  );

  readonly currentSection = computed(() => this.routeLabel());

  private formatSection(url: string): string {
    const segment = url.split('/').filter(Boolean).at(-1) ?? 'dashboard';
    return segment
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
