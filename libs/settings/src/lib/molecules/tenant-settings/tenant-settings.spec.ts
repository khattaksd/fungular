import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ANALYTICS, NoopAnalytics } from '@libs/analytics';
import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
import {
  TranslateLoader,
  TranslationObject,
  provideTranslateService,
} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { TenantSettingsService } from '../../services/tenant-settings/tenant-settings.service';
import { TenantSettingsComponent } from './tenant-settings';

/** Serves the strings the template needs without touching HTTP. */
class StubTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<TranslationObject> {
    return of({
      SETTINGS: {
        TENANT_NAME: 'Tenant name',
        SAVE: 'Save',
        SAVING: 'Saving',
        SAVED: 'Saved',
        UPLOAD_LOGO: 'Upload logo',
      },
    });
  }
}

describe('TenantSettingsComponent', () => {
  let spectator: Spectator<TenantSettingsComponent>;
  let httpMock: HttpTestingController;

  const analytics = { ...new NoopAnalytics(), logEvent: vi.fn() };

  const createComponent = createComponentFactory({
    component: TenantSettingsComponent,
    providers: [
      { provide: ANALYTICS, useValue: analytics },
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

  /** The panel fetches workspace settings in its constructor; answer it. */
  const flushFetch = async (): Promise<void> => {
    httpMock.expectOne('/api/settings').flush({
      name: 'Solstice',
      domain: 'solstice.dev',
      seats: 5,
      seatsUsed: 5,
      logo: './assets/logo.svg',
    });
    await spectator.fixture.whenStable();
    spectator.detectChanges();
  };

  beforeEach(() => {
    analytics.logEvent.mockReset();
    spectator = createComponent();
    httpMock = spectator.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('renders the workspace fetched from the API', async () => {
    await flushFetch();

    expect(spectator.query('img')?.getAttribute('src')).toBe(
      './assets/logo.svg',
    );
    expect(spectator.element.textContent).toContain('Solstice');
  });

  it('surfaces a fetch failure as an alert', async () => {
    httpMock
      .expectOne('/api/settings')
      .flush({ message: 'down' }, { status: 500, statusText: 'Server Error' });
    await spectator.fixture.whenStable();
    spectator.detectChanges();

    expect(spectator.query('[role="alert"]')).toExist();
  });

  it('saves the tenant name and reports the event', async () => {
    await flushFetch();

    spectator.click('button[type="submit"]');
    httpMock.expectOne('/api/settings').flush({
      name: 'Solstice',
      domain: 'solstice.dev',
      seats: 5,
      seatsUsed: 5,
      logo: './assets/logo.svg',
    });
    await spectator.fixture.whenStable();
    spectator.detectChanges();

    expect(analytics.logEvent).toHaveBeenCalledWith('tenant_settings_saved');
    expect(spectator.element.textContent).toContain('Saved');
  });

  it('shows the API error when saving fails', async () => {
    await flushFetch();

    spectator.click('button[type="submit"]');
    httpMock
      .expectOne('/api/settings')
      .flush(
        { message: 'timed out' },
        { status: 503, statusText: 'Unavailable' },
      );
    await spectator.fixture.whenStable();
    spectator.detectChanges();

    expect(analytics.logEvent).not.toHaveBeenCalled();
    expect(spectator.query('[role="alert"]')).toExist();
  });

  it('shows the uploaded logo and reports the event', async () => {
    await flushFetch();

    spectator.click(spectator.queryAll('button')[1]);
    httpMock
      .expectOne('/api/settings/logo')
      .flush({ url: './assets/logo.svg' });
    await spectator.fixture.whenStable();
    spectator.detectChanges();

    expect(analytics.logEvent).toHaveBeenCalledWith('tenant_logo_uploaded');
    expect(spectator.query('img')?.getAttribute('src')).toBe(
      './assets/logo.svg',
    );
  });

  it('shows the API error when the logo upload fails', async () => {
    await flushFetch();

    spectator.click(spectator.queryAll('button')[1]);
    httpMock
      .expectOne('/api/settings/logo')
      .flush(
        { message: 'forbidden' },
        { status: 403, statusText: 'Forbidden' },
      );
    await spectator.fixture.whenStable();
    spectator.detectChanges();

    expect(analytics.logEvent).not.toHaveBeenCalled();
    expect(spectator.query('[role="alert"]')).toExist();
  });
});
