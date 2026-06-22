import { provideAbpCore, withOptions } from '@abp/ng.core';
import { provideAbpOAuth } from '@abp/ng.oauth';
import { provideSettingManagementConfig } from '@abp/ng.setting-management/config';
import { provideFeatureManagementConfig } from '@abp/ng.feature-management';
import { provideAbpThemeShared,} from '@abp/ng.theme.shared';
import { provideIdentityConfig } from '@abp/ng.identity/config';
import { provideAccountConfig } from '@abp/ng.account/config';
import { registerLocaleForEsBuild } from '@abp/ng.core/locale';
import { provideThemeLeptonX } from '@abp/ng.theme.lepton-x';
import { provideSideMenuLayout } from '@abp/ng.theme.lepton-x/layouts';
import { provideLogo, withEnvironmentOptions } from "@abp/ng.theme.shared";
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { environment } from '@env/environment';
import { APP_ROUTES } from './app.routes';
import { PortfolioRequestContextInterceptor } from '@core/interceptors/portfolio-request-context.interceptor';
import { PORTFOLIO_APP_NAME } from '@core/tokens/portfolio-app-name.token';
import { APP_ROUTE_PROVIDER } from './route.provider';
import { FOOTER_PROVIDER } from './footer/footer.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      APP_ROUTES,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
    ),
    ...APP_ROUTE_PROVIDER,
    ...FOOTER_PROVIDER,
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideAbpCore(
      withOptions({
        environment,
        registerLocaleFn: registerLocaleForEsBuild(),
      }),
    ),
    provideAbpOAuth(),
    provideIdentityConfig(),
    provideSettingManagementConfig(),
    provideFeatureManagementConfig(),
    provideThemeLeptonX(),
    provideSideMenuLayout(),
    provideLogo(withEnvironmentOptions(environment)),
    provideAccountConfig(),
    provideAbpThemeShared(),
    {
      provide: PORTFOLIO_APP_NAME,
      useValue: 'Kareem Full Stack Portfolio',
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: PortfolioRequestContextInterceptor,
      multi: true,
    },
  ]
};
