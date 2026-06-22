import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="not-found">
      <p>404</p>
      <h1>Page not found</h1>
      <span>The route you requested is not part of the current portfolio workspace.</span>
      <div class="not-found__actions">
        <a routerLink="/">Go home</a>
        <a routerLink="/admin/dashboard">Open admin</a>
      </div>
    </section>
  `,
  styles: [
    `
      .not-found {
        min-height: 100vh;
        display: grid;
        place-content: center;
        gap: 0.85rem;
        padding: 2rem;
        text-align: center;
        background: linear-gradient(180deg, #f7fbff 0%, #eef4f9 100%);
      }

      p,
      h1,
      span {
        margin: 0;
      }

      p {
        font-size: 0.85rem;
        letter-spacing: 0.16em;
        color: #71829a;
      }

      h1 {
        color: #132238;
      }

      span {
        color: #5d6f86;
      }

      .not-found__actions {
        display: flex;
        gap: 0.85rem;
        justify-content: center;
        flex-wrap: wrap;
      }

      a {
        border-radius: 999px;
        padding: 0.85rem 1rem;
        text-decoration: none;
        background: #123b5c;
        color: #fff;
        font-weight: 600;
      }
    `,
  ],
})
export class NotFoundPageComponent {}
