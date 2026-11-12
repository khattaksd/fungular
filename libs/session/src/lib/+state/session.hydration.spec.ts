import { TestBed } from '@angular/core/testing';
import { SessionService } from '../services/session/session.service';
import { SessionStore } from './session.store';

/**
 * Hydration happens at store construction, so this lives in its own spec file:
 * a fresh test environment guarantees a brand-new root singleton that reads the
 * seeded localStorage.
 */
describe('SessionStore hydration', () => {
  it('restores a previous session from localStorage', () => {
    localStorage.setItem(
      'fungular.session',
      JSON.stringify({
        token: 'tok',
        user: { id: 'u-alex', name: 'Alex Rivera', email: 'alex@example.com' },
        tenants: [
          { id: 'solstice', name: 'Solstice', logo: '', role: 'Owner' },
          { id: 'harbor', name: 'Harbor', logo: '', role: 'Admin' },
        ],
        currentTenantId: 'harbor',
      }),
    );
    TestBed.configureTestingModule({
      providers: [
        SessionStore,
        { provide: SessionService, useValue: { login: vi.fn() } },
      ],
    });
    const store = TestBed.inject(SessionStore);
    expect(store.isAuthenticated()).toBe(true);
    expect(store.currentTenant()?.id).toBe('harbor');
  });
});