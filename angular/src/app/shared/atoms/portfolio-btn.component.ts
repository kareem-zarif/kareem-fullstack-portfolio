import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

export type BtnVariant = 'primary' | 'outline' | 'ghost';
export type BtnSize = 'md' | 'lg' | 'sm';

@Component({
  selector: 'app-portfolio-btn',
  standalone: true,
  imports: [RouterLink, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // NOTE: a single <ng-content> at the top level. Splitting it across multiple
  // @if branches breaks content projection (Angular only fills one slot), which
  // rendered the projected icon + label as empty button shells.
  template: `
    <a
      class="kz-btn"
      [ngClass]="btnClasses()"
      [routerLink]="routerPath() || null"
      [attr.href]="anchorHref()"
      [attr.target]="external() ? '_blank' : null"
      [attr.rel]="external() ? 'noopener noreferrer' : null"
      [attr.download]="download() || null"
      [attr.role]="isButton() ? 'button' : null"
      [attr.tabindex]="isButton() && !disabled() ? '0' : null"
      [attr.aria-disabled]="disabled() ? 'true' : null"
      (keydown.enter)="onActivate($event)"
      (keydown.space)="onActivate($event)"
    >
      <ng-content />
    </a>
  `,
  styles: [`
    :host { display: contents; }

    .kz-btn--lg { height: 48px; padding: 0 22px; font-size: 15px; }
    .kz-btn--sm { height: 36px; padding: 0 14px; font-size: 13px; }

    .kz-btn[aria-disabled="true"] { opacity: .55; pointer-events: none; }

    .kz-btn ::ng-deep svg { width: 18px; height: 18px; flex-shrink: 0; }
    .kz-btn--sm ::ng-deep svg { width: 16px; height: 16px; }
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

  /** No navigation target → behaves as a button (parent handles (click)). */
  readonly isButton = computed(() => !this.href() && !this.routerPath());

  /** Only set a raw href when not using routerLink. */
  readonly anchorHref = computed(() => (this.routerPath() ? null : this.href() || null));

  btnClasses() {
    return {
      [`kz-btn--${this.variant()}`]: true,
      [`kz-btn--${this.size()}`]: this.size() !== 'md',
    };
  }

  /** Mirror native button keyboard activation for the button-role case. */
  onActivate(event: Event) {
    if (!this.isButton() || this.disabled()) return;
    event.preventDefault();
    (event.target as HTMLElement).click();
  }
}
