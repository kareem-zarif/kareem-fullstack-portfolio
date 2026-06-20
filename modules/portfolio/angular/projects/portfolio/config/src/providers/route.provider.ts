import { eLayoutType, RoutesService } from '@abp/ng.core';
import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { eportfolioRouteNames } from '../enums/route-names';

export const PORTFOLIO_ROUTE_PROVIDERS = [
  provideAppInitializer(() => {
    configureRoutes();
  }),
];

export function configureRoutes() {
  const routesService = inject(RoutesService);
  routesService.add([
    {
      path: '/portfolio',
      name: eportfolioRouteNames.portfolio,
      iconClass: 'fas fa-book',
      layout: eLayoutType.application,
      order: 3,
    },
  ]);
}

const PORTFOLIO_PROVIDERS: EnvironmentProviders[] = [...PORTFOLIO_ROUTE_PROVIDERS];

export function provideportfolio() {
  return makeEnvironmentProviders(PORTFOLIO_PROVIDERS);
}
