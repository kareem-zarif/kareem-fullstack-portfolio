import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

export type BtnVariant = 'primary' | 'outline' | 'ghost';
export type BtnSize = 'md' | 'lg' | 'sm';

@Component({
  selector: 'app-portfolio-btn',
  standalone: true,
  imports: [RouterLink, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (href()) {
      <a
        [href]="href()"
        [attr.target]="external() ? '_blank' : null"
        [attr.rel]="external() ? 'noopener noreferrer' : null"
        [attr.download]="download() || null"
        class="kz-btn"
        [ngClass]="btnClasses()"
      >
        <ng-content />
      </a>
    } @else if (routerPath()) {
      <a [routerLink]="routerPath()" class="kz-btn" [ngClass]="btnClasses()">
        <ng-content />
      </a>
    } @else {
      <button type="button" class="kz-btn" [ngClass]="btnClasses()" [disabled]="disabled()">
        <ng-content />
      </button>
    }
  `,
  styles: [`
    :host { display: contents; }

    .kz-btn--lg { height: 48px; padding: 0 22px; font-size: 15px; }
    .kz-btn--sm { height: 36px; padding: 0 14px; font-size: 13px; }

    .kz-btn :ng-deep svg { width: 18px; height: 18px; flex-shrink: 0; }
    .kz-btn--sm :ng-deep svg { width: 16px; height: 16px; }
  `],
})
export class PortfolioBtnComponent {
  readonly variant = input<BtnVariant>('primary');
  readonly size = input<BtnSize>('md');
  readonly href = input<string | null>(null);
  readonly routerPath = input<string | null>(null);
  readonly external = input(false);
  readonly download = input<string | null>(null);
  readonly disabled = input(false);

  btnClasses() {
    return {
      [`kz-btn--${this.variant()}`]: true,
      [`kz-btn--${this.size()}`]: this.size() !== 'md',
    };
  }
}
