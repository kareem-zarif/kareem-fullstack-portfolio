import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LogoMarkComponent } from '@shared/atoms/logo-mark.component';

@Component({
  selector: 'app-nav-brand',
  standalone: true,
  imports: [RouterLink, LogoMarkComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="nav-brand" routerLink="/" [attr.aria-label]="fullName()">
      <app-logo-mark />
      <span class="brand-name">
        {{ firstName() }}<b> {{ lastName() }}</b>
      </span>
    </a>
  `,
  styles: [`
    .nav-brand {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
      text-decoration: none;
      color: var(--text, #f4f5f0);
      /* Keep logo-mark before the Latin name in both LTR and RTL
         so the brand reads identically in English and Arabic. */
      direction: ltr;
    }

    .brand-name {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -.01em;
      white-space: nowrap;
    }

    .brand-name b {
      color: var(--accent-text, #b2e742);
      font-weight: 700;
    }
  `],
})
export class NavBrandComponent {
  readonly fullName = input('Kareem Zarif');
  readonly firstName = input('Kareem');
  readonly lastName = input('Zarif');
}
