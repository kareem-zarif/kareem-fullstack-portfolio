import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from '@shared/admin/admin-sidebar.component';
import { AdminTopbarComponent } from '@shared/admin/admin-topbar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminSidebarComponent, AdminTopbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-layout">
      <app-admin-sidebar />
      <div class="admin-layout__content">
        <app-admin-topbar />
        <main class="admin-layout__main">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-layout {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 280px minmax(0, 1fr);
        background: #f3f7fb;
      }

      .admin-layout__content {
        min-width: 0;
      }

      .admin-layout__main {
        padding: 1.5rem;
      }

      @media (max-width: 960px) {
        .admin-layout {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AdminLayoutComponent {}
