import { Routes } from '@angular/router';
import { HomePage } from './home/home';
import { NotFoundPage } from './not-found/not-found';

export const appPagesRoutes: Routes = [
  {
    // No route title: the home page keeps the app name alone ("fungular")
    // instead of "fungular · fungular".
    path: '',
    component: HomePage,
  },
  {
    path: 'profile',
    title: 'PROFILE.TITLE',
    loadChildren: () => import('@libs/profile').then((m) => m.profileRoutes),
  },
  {
    path: 'settings',
    title: 'SETTINGS.TITLE',
    loadChildren: () => import('@libs/settings').then((m) => m.settingsRoutes),
  },
  {
    path: '**',
    title: 'NOT_FOUND.TITLE',
    component: NotFoundPage,
  },
];
