import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { SiteSettingsService } from '@features/portfolio/services/site-settings.service';
import { SiteSetting } from '@shared/models';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div>
        <strong>{{ brandName() }}</strong>
        <p>{{ availability() }}</p>
      </div>
      <div class="footer__links">
        <a routerLink="/projects">Projects</a>
        <a routerLink="/experience">Experience</a>
        <a routerLink="/contact">Contact</a>
      </div>
      <div class="footer__meta">
        <span>{{ email() }}</span>
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
        border-top: 1px solid rgba(17, 38, 58, 0.08);
        color: #5b6d84;
      }

      strong {
        color: #132238;
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
        color: #163f62;
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
  private readonly settings = toSignal(inject(SiteSettingsService).getSiteSettings(), {
    initialValue: [] as SiteSetting[],
  });

  readonly brandName = computed(
    () => this.settings().find(setting => setting.key === 'brandName')?.value ?? 'Portfolio',
  );
  readonly email = computed(
    () => this.settings().find(setting => setting.key === 'email')?.value ?? 'hello@example.com',
  );
  readonly availability = computed(
    () => this.settings().find(setting => setting.key === 'availability')?.value ?? '',
  );
}
