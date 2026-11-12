import { HttpResponse, HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import type { Mock } from 'vitest';
import { SessionService } from './session/session.service';
import { SessionStore } from '../+state/session.store';
import { tenantHeaderInterceptor } from './tenant-header.interceptor';

const TENANTS = [
  { id: 'solstice', name: 'Solstice', logo: '', role: 'Owner' },
  { id: 'harbor', name: 'Harbor', logo: '', role: 'Admin' },
];

describe('tenantHeaderInterceptor', () => {
  let service: { login: Mock };
  let store: InstanceType<typeof SessionStore>;

  beforeEach(() => {
    service = { login: vi.fn() };
    TestBed.configureTestingModule({
      providers: [SessionStore, { provide: SessionService, useValue: service }],
    });
    store = TestBed.inject(SessionStore);
    service.login.mockReturnValue(
      of({
        token: 't',
        user: { id: 'u', name: 'Alex', email: 'alex@example.com' },
        tenants: TENANTS,
      }),
    );
    store.login({ email: 'alex@example.com', password: 'x' });
    store.chooseTenant('harbor');
  });

  const run = (url: string): HttpRequest<unknown> => {
    let out: HttpRequest<unknown> | undefined;
    TestBed.runInInjectionContext(() =>
      tenantHeaderInterceptor(new HttpRequest('GET', url), (req) => {
        out = req;
        return of(new HttpResponse({ status: 200 }));
      }),
    );
    return out!;
  };

  it('adds X-Tenant-Id when a tenant is active', () => {
    expect(store.currentTenant()?.id).toBe('harbor');
    expect(run('/api/projects').headers.get('X-Tenant-Id')).toBe('harbor');
  });

  it('skips the header for auth requests', () => {
    expect(run('/api/auth/login').headers.get('X-Tenant-Id')).toBeNull();
  });
});