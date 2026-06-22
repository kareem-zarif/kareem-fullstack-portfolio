import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PublicContactApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apis.default.url.replace(/\/$/, '');

  submitMessage(payload: PublicContactSubmissionPayload): Observable<PublicContactSubmissionResult> {
    return this.http.post<PublicContactSubmissionResult>(`${this.apiBaseUrl}/api/contact`, payload);
  }
}

export interface PublicContactSubmissionPayload {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  honeypot?: string;
}

export interface PublicContactSubmissionResult {
  submissionId: string;
  submittedAtUtc: string;
}
