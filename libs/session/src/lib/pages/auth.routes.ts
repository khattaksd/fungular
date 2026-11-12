import { Routes } from '@angular/router';
import { LoginPage } from './login/login';
import { WorkspacesPage } from './workspaces/workspaces';
import { guestOnlyGuard, requireAuthGuard } from '../guards/auth.guards';

export const authRoutes: Routes = [
  {
    path: 'login',
    // Already signed in → skip the login page. Signed out → pass through.
    canActivate: [guestOnlyGuard],
    component: LoginPage,
  },
  {
    path: 'workspaces',
    canActivate: [requireAuthGuard],
    component: WorkspacesPage,
  },
];
