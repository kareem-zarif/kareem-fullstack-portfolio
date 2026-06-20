import { inject, Injectable } from '@angular/core';
import { RestService } from '@abp/ng.core';

@Injectable({
  providedIn: 'root',
})
export class portfolioService {
  apiName = 'portfolio';

  private restService = inject(RestService);

  sample() {
    return this.restService.request<void, any>(
      { method: 'GET', url: '/api/portfolio/example' },
      { apiName: this.apiName }
    );
  }
}
