import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
import {
  TranslateLoader,
  TranslationObject,
  provideTranslateService,
} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { App } from './app';

class StubTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<TranslationObject> {
    return of({ HEADER: { HOME: 'Home', START: 'Get started' }, SHELL: {} });
  }
}

describe('App', () => {
  let spectator: Spectator<App>;
  const createComponent = createComponentFactory({
    component: App,
    providers: [
      // The root component renders the shell, so its dependencies have to be
      // satisfied here — that is the cost of the shell being app chrome rather
      // than something each page repeats.
      provideRouter([]),
      provideHttpClient(),
      provideHttpClientTesting(),
      provideTranslateService({
        loader: [{ provide: TranslateLoader, useClass: StubTranslateLoader }],
        lang: 'en',
        fallbackLang: 'en',
      }),
    ],
  });

  beforeEach(() => {
    // The shell reads matchMedia to pick its initial layout; jsdom does not have it.
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: () => ({ matches: false, addEventListener: () => undefined }),
    });
    spectator = createComponent();
  });

  it('should render router outlet', () => {
    expect(spectator.query('router-outlet')).toBeTruthy();
  });

  it('renders the shell and its header on every route', () => {
    expect(spectator.query('lib-shell')).toBeTruthy();
    expect(spectator.query('header')).toBeTruthy();
  });
});
