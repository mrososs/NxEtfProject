import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideAuth0 } from '@auth0/auth0-angular';

import { HttpClient } from '@angular/common/http';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      defaultLanguage: 'en', // Set your default language here
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAuth0({
      domain: 'dev-rzc7torub3i1zvqu.us.auth0.com',
      clientId: 'cOOKZwR3a6WMK7SRLNC0yosSFZ4lCs7K',
      authorizationParams: {
        redirect_uri: window.location.origin,
        scope: 'openid profile email',
      },
      useRefreshTokens: true,
      cacheLocation: 'localstorage',
    }),
    provideRouter(appRoutes),
  ],
};
