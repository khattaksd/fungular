import { ShellLogo, ShellNavItem } from '@libs/ui';

/**
 * Data for the shell. Navigation is supplied by the app so the shell library
 * never imports a feature.
 */
export const NAV_ITEMS: readonly ShellNavItem[] = [
  {
    id: 'dashboard',
    labelKey: 'SHELL.NAV_DASHBOARD',
    icon: 'home',
    route: '/',
    exact: true,
  },
  {
    id: 'projects',
    labelKey: 'SHELL.NAV_PROJECTS',
    icon: 'briefcase',
    route: '/projects',
  },
  { id: 'tasks', labelKey: 'SHELL.NAV_TASKS', icon: 'files', route: '/tasks' },
  { id: 'team', labelKey: 'SHELL.NAV_TEAM', icon: 'users', route: '/team' },
];

export const FOOTER_ITEMS: readonly ShellNavItem[] = [
  {
    id: 'settings',
    labelKey: 'SHELL.NAV_SETTINGS',
    icon: 'settings',
    route: '/settings',
  },
  {
    id: 'billing',
    labelKey: 'SHELL.NAV_BILLING',
    icon: 'credit-card',
    route: '/billing',
  },
  { id: 'help', labelKey: 'SHELL.HELP', icon: 'life-buoy' },
];

/** The mark behind every tenant ("Powered by ..."). The navy monogram badge. */
export const PLATFORM_LOGO: ShellLogo = {
  url: './assets/logo.svg',
  alt: 'fungular',
};

/** The signed-in demo user (matches the mock API). */
export const DEMO_USER = { name: 'Alex' };
