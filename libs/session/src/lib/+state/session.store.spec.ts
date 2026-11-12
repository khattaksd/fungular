import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { SessionService } from '../services/session/session.service';
import { SessionStore } from './session.store';

const TENANTS = [
  { id: 'solstice', name: 'Solstice', logo: './assets/brands/solstice-logo.svg', role: 'Owner' },
  { id: 'harbor', name: 'Harbor', logo: './assets/brands/harbor-logo.svg', role: 'Admin' },
];
const AUTH = {
  token: 'tok',
  user: { id: 'u-alex', name: 'Alex Rivera', email: 'alex@example.com' },
  tenants: TENANTS,
};

describe('SessionStore', () => {
  let service: { login: Mock };

  const setup = (): InstanceType<typeof SessionStore> => {
    service = { login: vi.fn() };
    TestBed.configureTestingModule({
      providers: [SessionStore, { provide: SessionService, useValue: service }],
    });
    return TestBed.inject(SessionStore);
  };

  afterEach(() => localStorage.clear());

  it('starts signed out', () => {
    const store = setup();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.user()).toBeNull();
    expect(store.tenants()).toEqual([]);
  });

  it('logs a single-tenant user straight into that tenant', () => {
    const store = setup();
    service.login.mockReturnValue(of({ ...AUTH, tenants: [TENANTS[0]] }));
    store.login({ email: 'single@example.com', password: 'x' });
    expect(store.isAuthenticated()).toBe(true);
    expect(store.currentTenant()?.id).toBe('solstice');
    expect(store.hasMultipleTenants()).toBe(false);
  });

  it('logs a multi-tenant user in without picking a tenant', () => {
    const store = setup();
    service.login.mockReturnValue(of(AUTH));
    store.login({ email: 'alex@example.com', password: 'x' });
    expect(store.isAuthenticated()).toBe(true);
    expect(store.currentTenant()).toBeNull();
    expect(store.hasMultipleTenants()).toBe(true);
  });

  it('chooses a tenant and persists the session', () => {
    const store = setup();
    service.login.mockReturnValue(of(AUTH));
    store.login({ email: 'alex@example.com', password: 'x' });
    store.chooseTenant('harbor');
    expect(store.currentTenant()?.id).toBe('harbor');
    const stored = JSON.parse(localStorage.getItem('fungular.session')!);
    expect(stored.currentTenantId).toBe('harbor');
  });

  it('ignores choosing a tenant the user does not belong to', () => {
    const store = setup();
    service.login.mockReturnValue(of(AUTH));
    store.login({ email: 'alex@example.com', password: 'x' });
    store.chooseTenant('meadow');
    expect(store.currentTenant()).toBeNull();
  });

  it('reports a failed login without keeping the loading flag', () => {
    const store = setup();
    service.login.mockReturnValue(throwError(() => ({ message: 'boom', code: 'E', status: 500 })));
    store.login({ email: 'alex@example.com', password: 'x' });
    expect(store.error()?.message).toBe('boom');
    expect(store.loading()).toBe(false);
  });

  it('logs out and clears the stored session', () => {
    const store = setup();
    service.login.mockReturnValue(of(AUTH));
    store.login({ email: 'alex@example.com', password: 'x' });
    store.logout();
    expect(store.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('fungular.session')).toBeNull();
  });
});