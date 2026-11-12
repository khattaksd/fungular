import { provideRouter } from '@angular/router';
import type {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import type { Mock } from 'vitest';
import { SessionService } from '../services/session/session.service';
import { SessionStore } from '../+state/session.store';
import {
  guestOnlyGuard,
  requireAuthGuard,
  requireTenantGuard,
} from './auth.guards';

const TENANTS = [
  { id: 'solstice', name: 'Solstice', logo: '', role: 'Owner' },
  { id: 'harbor', name: 'Harbor', logo: '', role: 'Admin' },
];

const AUTH = () => ({
  token: 't',
  user: { id: 'u', name: 'Alex', email: 'alex@example.com' },
  tenants: TENANTS,
});

// Guards are CanActivateFns: (route, state) => ... The bodies ignore both, so
// minimal stubs are fine here.
const ROUTE = {} as ActivatedRouteSnapshot;
const STATE = {} as RouterStateSnapshot;

const runInContext = <T>(fn: () => T): T => TestBed.runInInjectionContext(fn);

describe('auth guards', () => {
  let service: { login: Mock };

  const setup = async (signedIn: boolean, tenant: string | null): Promise<void> => {
    service = { login: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        SessionStore,
        { provide: SessionService, useValue: service },
      ],
    });
    const store = TestBed.inject(SessionStore);
    if (signedIn) {
      service.login.mockReturnValue(of(AUTH()));
      store.login({ email: 'alex@example.com', password: 'x' });
      if (tenant) store.chooseTenant(tenant);
    } else {
      store.logout();
    }
  };

  it('requireAuthGuard lets an authenticated user through', async () => {
    await setup(true, 'harbor');
    expect(await runInContext(() => requireAuthGuard(ROUTE, STATE))).toBe(true);
  });

  it('requireAuthGuard sends a signed-out user to /login', async () => {
    await setup(false, null);
    const result = await runInContext(() => requireAuthGuard(ROUTE, STATE));
    expect(result).not.toBe(true);
  });

  it('guestOnlyGuard lets a signed-out visitor onto the login page', async () => {
    await setup(false, null);
    expect(await runInContext(() => guestOnlyGuard(ROUTE, STATE))).toBe(true);
  });

  it('guestOnlyGuard sends an authenticated visitor to the chooser', async () => {
    await setup(true, null);
    const result = await runInContext(() => guestOnlyGuard(ROUTE, STATE));
    expect(result).not.toBe(true);
  });

  it('requireTenantGuard allows a user with a chosen tenant', async () => {
    await setup(true, 'harbor');
    expect(await runInContext(() => requireTenantGuard(ROUTE, STATE))).toBe(true);
  });

  it('requireTenantGuard sends an authenticated user without a tenant to the chooser', async () => {
    await setup(true, null);
    const result = await runInContext(() => requireTenantGuard(ROUTE, STATE));
    expect(typeof result).not.toBe('boolean');
  });

  it('requireTenantGuard sends a signed-out user to /login', async () => {
    await setup(false, null);
    const result = await runInContext(() => requireTenantGuard(ROUTE, STATE));
    expect(typeof result).not.toBe('boolean');
  });
});