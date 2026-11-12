import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionStore } from '../+state/session.store';

/**
 * Adds `X-Tenant-Id` to every request so the mock API (and a future real one)
 * serves the active tenant's data. Auth calls have no tenant yet — they carry
 * the id in the body instead.
 */
export const tenantHeaderInterceptor: HttpInterceptorFn = (request, next) => {
  const store = inject(SessionStore);
  const tenantId = store.currentTenantId();
  if (!tenantId || request.url.includes('/api/auth/')) return next(request);
  return next(request.clone({ setHeaders: { 'X-Tenant-Id': tenantId } }));
};
