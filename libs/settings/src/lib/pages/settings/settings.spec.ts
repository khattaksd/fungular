import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ANALYTICS, NoopAnalytics } from '@libs/analytics';
import { Language } from '@libs/entity';
import { ThemeService } from '@libs/theme';
import { UpdateLanguageService } from '@libs/translation';
import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
import { TenantSettingsService } from '../../services/tenant-settings/tenant-settings.service';
import {
  TranslateLoader,
  TranslationObject,
  provideTranslateService,
} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { SettingsStore } from '../../+state/settings.store';
import { Settings } from './settings';

/** Serves the strings the template needs without touching HTTP. */
class StubTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<TranslationObject> {
    return of({
      SETTINGS: {
        TITLE: 'Settings',
        LEAD: 'Preferences are stored on this device.',
        THEME: 'Theme',
        THEME_DESC: 'System follows your operating system setting.',
        THEME_LIGHT: 'Light',
        THEME_DARK: 'Dark',
        THEME_SYSTEM: 'System',
        LANGUAGE: 'Language',
        LANGUAGE_DESC: 'Applies immediately.',
        REDUCE_MOTION: 'Reduce motion',
        REDUCE_MOTION_DESC: 'Minimises transitions.',
      },
    });
  }
}

describe('Settings', () => {
  let spectator: Spectator<Settings>;

  const themeService = {
    setPreference: vi.fn(),
    preference: () => 'system',
    isDark: () => false,
  };
  const languageService = {
    changeLanguage: vi.fn(),
    currentLanguage: () => Language.English,
  };
  const analytics = { ...new NoopAnalytics(), logEvent: vi.fn() };

  const createComponent = createComponentFactory({
    component: Settings,
    providers: [
      { provide: ThemeService, useValue: themeService },
      { provide: UpdateLanguageService, useValue: languageService },
      { provide: ANALYTICS, useValue: analytics },
      // Normally provided by the settings route, so a component-level test has to
      // register it explicitly.
      SettingsStore,
      TenantSettingsService,
      provideHttpClient(),
      provideHttpClientTesting(),
      provideTranslateService({
        loader: [{ provide: TranslateLoader, useClass: StubTranslateLoader }],
        lang: 'en',
        fallbackLang: 'en',
      }),
    ],
  });

  /** The tenant panel fetches workspace settings on init; answer it. */
  const flushTenant = async (): Promise<void> => {
    spectator.inject(HttpTestingController).expectOne('/api/settings').flush({
      name: 'Solstice',
      domain: 'solstice.dev',
      seats: 5,
      seatsUsed: 5,
      logo: './assets/logo.svg',
    });
    // The fetch resolves on a microtask after flush; let it land, then render.
    await spectator.fixture.whenStable();
    spectator.detectChanges();
  };

  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.classList.remove('reduce-motion');
    themeService.setPreference.mockReset();
    languageService.changeLanguage.mockReset();
    analytics.logEvent.mockReset();
    spectator = createComponent();
    spectator.detectChanges();
    await flushTenant();
  });

  it('renders the preference rows plus the workspace panel', () => {
    expect(spectator.queryAll('lib-setting-row').length).toBeGreaterThanOrEqual(
      3,
    );
    expect(spectator.query('lib-tenant-settings')).toBeTruthy();
    expect(spectator.element.textContent).toContain('Solstice');
  });

  it('renders the translated labels rather than raw keys', () => {
    expect(spectator.query('.page-header__title')?.textContent).toContain(
      'Settings',
    );
    expect(spectator.element.textContent).toContain('Reduce motion');
  });

  it('marks the active theme segment, reading it from ThemeService', () => {
    const active = spectator.query('.segmented__segment--active');
    expect(active?.textContent).toContain('System');
  });

  it('forwards a theme click to ThemeService', () => {
    spectator.click(
      spectator
        .queryAll('[role="radiogroup"]')[0]
        .querySelectorAll('button')[1],
    );

    expect(themeService.setPreference).toHaveBeenCalledWith('dark');
    expect(analytics.logEvent).toHaveBeenCalledWith(
      'theme_preference_changed',
      {
        preference: 'dark',
      },
    );
  });

  it('forwards a language click to UpdateLanguageService', () => {
    spectator.click(
      spectator
        .queryAll('[role="radiogroup"]')[1]
        .querySelectorAll('button')[3],
    );

    expect(languageService.changeLanguage).toHaveBeenCalledWith(
      Language.Portuguese,
    );
    expect(analytics.logEvent).toHaveBeenCalledWith('language_changed', {
      language: Language.Portuguese,
    });
  });

  it('toggles reduce motion and reflects it on the switch', () => {
    expect(
      spectator.query('[role="switch"]')?.getAttribute('aria-checked'),
    ).toBe('false');

    spectator.click('[role="switch"]');
    spectator.detectChanges();

    expect(
      spectator.query('[role="switch"]')?.getAttribute('aria-checked'),
    ).toBe('true');
    expect(document.documentElement.classList.contains('reduce-motion')).toBe(
      true,
    );
    expect(analytics.logEvent).toHaveBeenCalledWith('reduce_motion_changed', {
      enabled: true,
    });
  });

  it('skips the event when the active theme is chosen again', () => {
    spectator.component.setTheme('system');

    expect(themeService.setPreference).not.toHaveBeenCalled();
    expect(analytics.logEvent).not.toHaveBeenCalled();
  });

  it('skips the event when the current language is chosen again', () => {
    spectator.component.setLanguage(Language.English);

    expect(languageService.changeLanguage).not.toHaveBeenCalled();
    expect(analytics.logEvent).not.toHaveBeenCalled();
  });

  it('skips the event when reduce motion is already off', () => {
    spectator.component.setReduceMotion(false);

    expect(analytics.logEvent).not.toHaveBeenCalled();
  });
});
