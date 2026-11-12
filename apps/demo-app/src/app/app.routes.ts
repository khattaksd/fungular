import { Route } from '@angular/router';
import {
  authRoutes,
  requireTenantGuard,
} from '@libs/session';
import { NotFoundPage } from './pages/not-found/not-found';

export const appRoutes: Route[] = [
  // Auth is eager, not lazy: the session store, the guards and the tenant
  // interceptor are needed before any page exists, so the login and chooser
  // live in the initial bundle with it.
  ...authRoutes,
  {
    path: '',
    loadChildren: () =>
      import('./pages/pages.routes').then((m) => m.appPagesRoutes),
  },
  {
    path: 'projects',
    canActivate: [requireTenantGuard],
    loadChildren: () => import('@libs/projects').then((m) => m.projectsRoutes),
  },
  {
    path: 'tasks',
    canActivate: [requireTenantGuard],
    loadChildren: () => import('@libs/tasks').then((m) => m.tasksRoutes),
  },
  {
    path: 'team',
    canActivate: [requireTenantGuard],
    loadChildren: () => import('@libs/team').then((m) => m.teamRoutes),
  },
  {
    path: 'billing',
    canActivate: [requireTenantGuard],
    loadChildren: () => import('@libs/billing').then((m) => m.billingRoutes),
  },
  // The catch-all lives at the root so auth routes are never swallowed by it.
  {
    path: '**',
    title: 'NOT_FOUND.TITLE',
    component: NotFoundPage,
  },
];