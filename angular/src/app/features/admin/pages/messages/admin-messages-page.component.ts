import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContactMessagesService } from '@features/portfolio/services/contact-messages.service';
import { DataPanelComponent } from '@shared/organisms/data-panel.component';
import { ChipComponent } from '@shared/atoms/chip.component';
import { trackById } from '@core/utils/track-by.util';
import { ContactMessage } from '@shared/models';

@Component({
  selector: 'app-admin-messages-page',
  standalone: true,
  imports: [CommonModule, DataPanelComponent, ChipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-data-panel
      title="Messages inbox"
      subtitle="A searchable inbox view that is ready to swap placeholder data for backend results."
    >
      <input
        panel-actions
        type="search"
        class="search"
        placeholder="Search sender, email, or subject"
        [value]="search()"
        (input)="search.set($any($event.target).value)"
      />

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th class="cell--strong">Sender</th>
              <th>Email</th>
              <th class="cell--strong">Subject</th>
              <th>Status</th>
              <th>Received</th>
            </tr>
          </thead>
          <tbody>
            @for (message of filteredMessages(); track trackById($index, message)) {
              <tr>
                <td class="cell cell--strong cell--truncate">{{ message.name }}</td>
                <td class="cell cell--truncate">{{ message.email }}</td>
                <td class="cell cell--strong cell--truncate">{{ message.subject }}</td>
                <td class="cell">
                  <app-chip [label]="message.status" [tone]="message.status === 'New' ? 'warning' : message.status === 'Reviewed' ? 'success' : 'neutral'" />
                </td>
                <td class="cell">{{ message.receivedAt | date: 'short' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </app-data-panel>
  `,
  styles: [
    `
      .search {
        width: min(24rem, 100%);
        border-radius: 999px;
        border: 1px solid #cfdae6;
        padding: 0.85rem 1rem;
        background: #f9fbfd;
      }

      .table-wrap {
        overflow-x: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        text-align: left;
        padding: 0.9rem 0.75rem;
        border-bottom: 1px solid #ebf0f5;
      }

      th {
        color: #6d7d94;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .cell {
        color: #5f7088;
      }

      .cell--strong {
        color: #132238;
        font-weight: 700;
        max-width: 16rem;
      }

      .cell--truncate {
        max-width: 14rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `,
  ],
})
export class AdminMessagesPageComponent {
  readonly trackById = trackById;
  readonly search = signal('');
  readonly messages = toSignal(inject(ContactMessagesService).getMessages(), {
    initialValue: [] as ContactMessage[],
  });
  readonly filteredMessages = computed(() => {
    const term = this.search().trim().toLowerCase();
    return term
      ? this.messages().filter(message =>
          `${message.name} ${message.email} ${message.subject}`.toLowerCase().includes(term),
        )
      : this.messages();
  });
}
