import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  NavigationEnd,
  PreloadAllModules,
  Router,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
} from '@angular/router';
import { Title } from '@angular/platform-browser';
import { appRoutes } from './app.routes';

import { brandPaths, environment } from '@libs/environment';
import { provideBrandTheme } from '@libs/theme';

import { provideRouterStore } from '@ngrx/router-store';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import {
  provideHttpClient,
  withInterceptors,
  withXhr,
} from '@angular/common/http';
import { ANALYTICS } from '@libs/analytics';
import { GlobalErrorHandler, httpErrorInterceptor } from '@libs/ui';
import { provideTranslation } from '@libs/translation';
import { metaReducers, reducers } from './core/+state';
import { CustomSerializer } from './core/services/router/router-serializer';
import { filter } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // The app is signals + OnPush throughout, so zone.js has nothing to observe.
    provideZonelessChangeDetection(),
    provideRouter(
      appRoutes,
      withComponentInputBinding(),
      // Lazy chunks are small; fetch them in the background so navigation is instant.
      withPreloading(PreloadAllModules),
    ),

    provideHttpClient(
      withXhr(),
      // `/api/*` is answered by the Cloudflare Pages Functions mock (see
      // `functions/`), or by a real backend later — same-origin either way.
      withInterceptors([httpErrorInterceptor]),
    ),

    // Uncaught errors reach analytics instead of only the console.
    { provide: ErrorHandler, useClass: GlobalErrorHandler },

    // The global store exists for router state only. Feature state lives in a
    // SignalStore inside its own lib and is provided on the route that needs it.
    provideStore(reducers, { metaReducers }),
    // The serializer belongs here. Registering StoreRouterConnectingModule.forRoot()
    // as well would re-provide RouterStateSerializer and silently win, dropping
    // CustomSerializer for the default MinimalRouterStateSerializer.
    provideRouterStore({ serializer: CustomSerializer }),

    // Must come after provideHttpClient(): the i18n loader fetches assets/i18n.
    provideTranslation(),

    // Demo brands, loaded before first render. `?brand=solstice|harbor|meadow`
    // picks the brand; the default is Solstice. Served from static JSON until a
    // real branding source exists.
    provideBrandTheme({ urlFor: brandPaths.byBrand }),

    // Devtools ship real code and keep every action in memory. Keep them out of
    // production builds entirely rather than merely switching them to logOnly.
    ...(environment.production ? [] : [provideStoreDevtools({ maxAge: 25 })]),

    // Initialize analytics and track route changes. `ANALYTICS` resolves to the
    // no-op default until an implementation is registered with
    // `{ provide: ANALYTICS, useClass: ... }`; this block is unchanged either way.
    provideAppInitializer(() => {
      const analytics = inject(ANALYTICS);
      const router = inject(Router);
      const title = inject(Title);

      // Deliberately not awaited: the initializer gates first paint, and the
      // implementation may dynamically import a vendor SDK. Awaiting it would put a
      // network fetch in front of the user's first render for a purely observational
      // concern. Events fired before init resolves are dropped by design.
      void analytics.initialize();

      router.events
        .pipe(filter((e) => e instanceof NavigationEnd))
        .subscribe((e) => {
          // Read the title after TitleStrategy has run, so page_title carries the
          // translated string the user actually sees instead of undefined.
          analytics.logPageView(
            (e as NavigationEnd).urlAfterRedirects,
            title.getTitle(),
          );
        });
    }),
  ],
};
