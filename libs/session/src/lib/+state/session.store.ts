import { computed, inject } from '@angular/core';
import { ANALYTICS } from '@libs/analytics';
import { IGenericError } from '@libs/entity';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { AuthResponse, AppUser, Tenant } from '../models/session.model';
import { SessionService } from '../services/session/session.service';

export interface SessionState {
  auth: AuthResponse | null;
  currentTenantId: string | null;
  loading: boolean;
  error: IGenericError | null;
}

export const initialSessionState: SessionState = {
  auth: null,
  currentTenantId: null,
  loading: false,
  error: null,
};

const STORAGE_KEY = 'fungular.session';

interface StoredSession {
  token: string;
  user: AppUser;
  tenants: Tenant[];
  currentTenantId: string | null;
}

/** Reads a previous session from localStorage; malformed or missing → null. */
function readStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

function persist(store: {
  auth(): AuthResponse | null;
  currentTenantId(): string | null;
}): void {
  const auth = store.auth();
  if (!auth) return;
  const stored: StoredSession = {
    token: auth.token,
    user: auth.user,
    tenants: auth.tenants,
    currentTenantId: store.currentTenantId(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Private browsing or a full quota must not break login.
  }
}

/**
 * Session state for the whole app: the signed-in user, their tenants and the
 * active tenant.
 *
 * Unlike feature stores this is provided **in root**, not on a route — a route
 * guard and the tenant-header interceptor need it before any page exists, and
 * the tenant switch re-themes the app from the root component. That is the one
 * deliberate exception to the "provided on the route" rule.
 */
export const SessionStore = signalStore(
  { providedIn: 'root' },
  // Read inside the initializer, not at module scope: the store must pick up a
  // session written after the bundle loaded (and tests seed before injection).
  withState<SessionState>(() => {
    const stored = readStoredSession();
    return {
      ...initialSessionState,
      auth: stored
        ? { token: stored.token, user: stored.user, tenants: stored.tenants }
        : null,
      currentTenantId: stored?.currentTenantId ?? null,
    };
  }),
  withComputed(({ auth, currentTenantId, error }) => ({
    user: computed(() => auth()?.user ?? null),
    isAuthenticated: computed(() => auth() !== null),
    tenants: computed(() => auth()?.tenants ?? []),
    currentTenant: computed<Tenant | null>(
      () => auth()?.tenants.find((t) => t.id === currentTenantId()) ?? null,
    ),
    hasMultipleTenants: computed(() => (auth()?.tenants.length ?? 0) > 1),
    errorMessage: computed(() => error()?.message ?? null),
  })),
  withMethods(
    (
      store,
      service = inject(SessionService),
      analytics = inject(ANALYTICS),
    ) => {
      const identifyUser = (user: AppUser): void => {
        analytics.identifyUser(user.id, { email: user.email, name: user.name });
      };

      // The session store hydrates before page render, so restore identity for a
      // persisted authenticated session as well as after a fresh login.
      const restoredUser = store.user();
      if (restoredUser) identifyUser(restoredUser);

      return {
        /**
         * Fake login. On success: if the user belongs to exactly one tenant, that
         * tenant is entered immediately; otherwise the chooser decides.
         */
        login: rxMethod<{ email: string; password: string }>(
          pipe(
            tap(() => patchState(store, { loading: true, error: null })),
            switchMap(({ email, password }) =>
              service.login(email, password).pipe(
                tapResponse({
                  next: (auth) => {
                    const previousUserId = store.user()?.id;
                    if (previousUserId && previousUserId !== auth.user.id) {
                      analytics.resetUser();
                    }

                    const currentTenantId =
                      auth.tenants.length === 1 ? auth.tenants[0]!.id : null;
                    patchState(store, {
                      auth,
                      currentTenantId,
                      loading: false,
                    });
                    persist(store);
                    identifyUser(auth.user);
                    analytics.logEvent('user_logged_in', {
                      tenant_count: auth.tenants.length,
                      workspace_selected: currentTenantId !== null,
                    });
                    analytics.logInfo('authentication completed', {
                      tenant_count: auth.tenants.length,
                      workspace_selected: currentTenantId !== null,
                    });
                  },
                  error: (error: IGenericError) =>
                    patchState(store, { error, loading: false }),
                }),
              ),
            ),
          ),
        ),
        /** Picks the active tenant (the workspace). Data refetches via navigation. */
        chooseTenant(tenantId: string): void {
          if (!store.auth()?.tenants.some((t) => t.id === tenantId)) return;
          patchState(store, { currentTenantId: tenantId, error: null });
          persist(store);
          analytics.logEvent('workspace_selected', { workspace_id: tenantId });
          analytics.logInfo('workspace selected', { workspace_id: tenantId });
        },
        logout(): void {
          analytics.logEvent('user_logged_out');
          analytics.logInfo('authenticated session ended');
          analytics.resetUser();
          patchState(store, { auth: null, currentTenantId: null, error: null });
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch {
            // Ignore storage failures on logout.
          }
        },
      };
    },
  ),
);
