import {
  APP_INITIALIZER,
  ApplicationConfig,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { appRoutes } from './app.routes';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  withInterceptors,
} from '@angular/common/http';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AnalyticsRouterService } from './core/services/analytics-router.service';
import { AnalyticsService } from './core/services/analytics.service';
import { firstValueFrom } from 'rxjs';

function analyticsRouterInitializer(analyticsRouter: AnalyticsRouterService) {
  return () => analyticsRouter.init();
}

function analyticsSiteVisitorInitializer(analytics: AnalyticsService) {
  return () => {
    // Track site visitor on app startup
    // Use firstValueFrom to convert Observable to Promise for APP_INITIALIZER
    return firstValueFrom(analytics.trackSiteVisitor()).catch((error) => {
      // Silently handle errors to not disrupt app startup
      console.error('Error tracking site visitor:', error);
      // Return void to allow app to continue even if tracking fails
      return Promise.resolve();
    });
  };
}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptorsFromDi(),
      withInterceptors([apiInterceptor, authInterceptor])
    ),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      defaultLanguage: 'en', // Set your default language here
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      appRoutes,
      withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' })
    ),
    provideAnimations(),
    {
      provide: APP_INITIALIZER,
      useFactory: analyticsRouterInitializer,
      deps: [AnalyticsRouterService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: analyticsSiteVisitorInitializer,
      deps: [AnalyticsService],
      multi: true,
    },
  ],
};
