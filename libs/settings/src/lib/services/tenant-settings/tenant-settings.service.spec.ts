import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TenantSettingsService } from './tenant-settings.service';

describe('TenantSettingsService', () => {
  let service: TenantSettingsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TenantSettingsService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TenantSettingsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('fetches tenant settings', () => {
    let name = '';
    service.fetch().subscribe((settings) => (name = settings.name));
    http.expectOne('/api/settings').flush({ name: 'Solstice', domain: 'solstice.dev', seats: 5, seatsUsed: 5, logo: 'x' });
    expect(name).toBe('Solstice');
  });

  it('patches the tenant name', () => {
    service.update({ name: 'Solstice Labs' }).subscribe();
    const request = http.expectOne('/api/settings');
    expect(request.request.method).toBe('PATCH');
    request.flush({ name: 'Solstice Labs', domain: 'solstice.dev', seats: 5, seatsUsed: 5, logo: 'x' });
  });

  it('fakes a logo upload', () => {
    service.uploadLogo().subscribe();
    const request = http.expectOne('/api/settings/logo');
    expect(request.request.method).toBe('POST');
    request.flush({ url: './assets/logo.svg', name: 'logo.svg' });
  });
});
