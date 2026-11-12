import { inject } from '@angular/core';
import { Router } from '@angular/router';
import type { CanActivateFn } from '@angular/router';
import { SessionStore } from '../+state/session.store';

/**
 * Any signed-in state at all, for pages that need it. Redirects to login when
 * signed out — never use this on the login route itself.
 */
export const requireAuthGuard: CanActivateFn = () => {
  const store = inject(SessionStore);
  const router = inject(Router);
  return store.isAuthenticated()
    ? true
    : router.createUrlTree(['/login']);
};

/**
 * The inverse, for the login page: an authenticated visitor skips straight on
 * (to the chooser or the app) instead of being redirected back to /login.
 */
export const guestOnlyGuard: CanActivateFn = () => {
  const store = inject(SessionStore);
  const router = inject(Router);
  return store.isAuthenticated()
    ? router.createUrlTree(['/workspaces'])
    : true;
};

/**
 * A tenant must be chosen before any tenant-scoped page renders. Signed in but
 * with no tenant (fresh multi-tenant login) → the chooser.
 */
export const requireTenantGuard: CanActivateFn = () => {
  const store = inject(SessionStore);
  const router = inject(Router);
  if (!store.isAuthenticated()) return router.createUrlTree(['/login']);
  return store.currentTenant()
    ? true
    : router.createUrlTree(['/workspaces']);
};
