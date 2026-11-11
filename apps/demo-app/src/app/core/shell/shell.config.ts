import { ShellLogo, ShellNavItem } from '@libs/ui';

/**
 * Data for the shell. Navigation is supplied by the app so the shell library
 * never imports a feature.
 *
 * Items without a `route` are pages that are not built yet — they render as
 * "Coming soon".
 */
export const NAV_ITEMS: readonly ShellNavItem[] = [
  {
    id: 'home',
    labelKey: 'SHELL.NAV_HOME',
    icon: 'home',
    route: '/',
    exact: true,
  },
  {
    id: 'profile',
    labelKey: 'SHELL.NAV_PROFILE',
    icon: 'user',
    route: '/profile',
  },
];

export const FOOTER_ITEMS: readonly ShellNavItem[] = [
  { id: 'help', labelKey: 'SHELL.HELP', icon: 'life-buoy' },
  {
    id: 'settings',
    labelKey: 'SHELL.SETTINGS',
    icon: 'settings',
    route: '/settings',
  },
];

/** The mark behind every brand ("Powered by ..."). The navy peak-and-sunrise. */
export const PLATFORM_LOGO: ShellLogo = {
  url: './assets/logo.svg',
  alt: 'fungular',
};

/** The signed-in demo user on mock data. */
export const DEMO_USER = { name: 'Alex' };
