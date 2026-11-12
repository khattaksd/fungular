import { Routes } from '@angular/router';
import { requireTenantGuard } from '@libs/session';
import { DashboardPage } from './dashboard/dashboard';

export const appPagesRoutes: Routes = [
  {
    // The dashboard is the home page. No route title: it keeps the app name
    // alone ("fungular") instead of "fungular · fungular".
    path: '',
    component: DashboardPage,
    canActivate: [requireTenantGuard],
  },
  {
    path: 'profile',
    title: 'PROFILE.TITLE',
    canActivate: [requireTenantGuard],
    loadChildren: () => import('@libs/profile').then((m) => m.profileRoutes),
  },
  {
    path: 'settings',
    title: 'SETTINGS.TITLE',
    canActivate: [requireTenantGuard],
    loadChildren: () => import('@libs/settings').then((m) => m.settingsRoutes),
  },
];