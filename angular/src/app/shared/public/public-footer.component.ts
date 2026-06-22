import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { PortfolioHomePageApiService } from '@features/portfolio/services/portfolio-home-page-api.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div>
        <strong>{{ brandName() }}</strong>
        <p>{{ summary() }}</p>
      </div>
      <div class="footer__links">
        <a routerLink="/projects">Projects</a>
        <a routerLink="/experience">Experience</a>
        <a routerLink="/contact">Contact</a>
      </div>
      <div class="footer__meta">
        <span>{{ title() }}</span>
        <span>{{ currentYear }} © Portfolio workspace</span>
      </div>
    </footer>
  `,
  styles: [
    `
      .footer {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1rem;
        padding: 1.5rem clamp(1rem, 4vw, 2.5rem) 2rem;
        border-top: 1px solid var(--portfolio-border);
        color: var(--portfolio-muted);
      }

      strong {
        color: var(--portfolio-text);
      }

      p {
        margin: 0.45rem 0 0;
        max-width: 30rem;
      }

      .footer__links,
      .footer__meta {
        display: grid;
        gap: 0.45rem;
        justify-items: end;
      }

      a {
        color: var(--portfolio-primary);
        text-decoration: none;
        font-weight: 600;
      }

      @media (max-width: 900px) {
        .footer {
          grid-template-columns: 1fr;
        }

        .footer__links,
        .footer__meta {
          justify-items: start;
        }
      }
    `,
  ],
})
export class PublicFooterComponent {
  currentYear = new Date().getFullYear();
  private readonly identity = toSignal(inject(PortfolioHomePageApiService).getIdentity().pipe(catchError(() => of(null))), {
    initialValue: null,
  });

  readonly brandName = computed(() => this.identity()?.fullName ?? 'Kareem Zarif');
  readonly title = computed(() => this.identity()?.professionalTitle ?? 'Business-Oriented .NET Full Stack Developer');
  readonly summary = computed(() => this.identity()?.mainMessage ?? 'I build business systems, not just screens.');
}
