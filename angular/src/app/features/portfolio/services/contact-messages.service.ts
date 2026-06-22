import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ContactMessage } from '@shared/models';

type ContactMessagePayload = Pick<ContactMessage, 'name' | 'email' | 'subject' | 'message'>;

@Injectable({ providedIn: 'root' })
export class ContactMessagesService {
  private readonly messages = signal<ContactMessage[]>([
    {
      id: 'msg-001',
      name: 'Hiring Manager',
      email: 'manager@example.com',
      subject: 'Angular architecture discussion',
      message: 'We would like to discuss your approach to enterprise Angular architecture and delivery.',
      receivedAt: '2026-06-21T08:30:00Z',
      status: 'New',
    },
    {
      id: 'msg-002',
      name: 'Product Founder',
      email: 'founder@example.com',
      subject: 'Portfolio collaboration',
      message: 'Can we review a proposal for a dashboard-first MVP with a strong admin experience?',
      receivedAt: '2026-06-19T15:10:00Z',
      status: 'Reviewed',
    },
  ]);

  getMessages(): Observable<ContactMessage[]> {
    return of(this.messages());
  }

  submitMessage(payload: ContactMessagePayload): Observable<ContactMessage> {
    const message: ContactMessage = {
      id: `msg-${Date.now()}`,
      receivedAt: new Date().toISOString(),
      status: 'New',
      ...payload,
    };

    this.messages.update(current => [message, ...current]);
    return of(message);
  }
}
