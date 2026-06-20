import { Component, inject } from '@angular/core';
import { portfolioService } from '../services/portfolio.service';

@Component({
  selector: 'lib-portfolio',
  template: ` <p>portfolio works!</p> `,
})
export class portfolioComponent {
  protected readonly service = inject(portfolioService);

  constructor() {
    this.service.sample().subscribe(console.log);
  }
}
