import type { ShellNavItem } from '../src/lib/organisms/shell-nav/shell-nav';

export const NAV_ITEMS: readonly ShellNavItem[] = [
  {
    id: 'home',
    labelKey: 'SHELL.NAV_HOME',
    icon: 'home',
    route: '/',
    exact: true,
  },
  { id: 'profile', labelKey: 'SHELL.NAV_PROFILE', icon: 'user' },
  { id: 'soon', labelKey: 'SHELL.UNAVAILABLE', icon: 'clock' },
];

export const FOOTER_ITEMS: readonly ShellNavItem[] = [
  { id: 'help', labelKey: 'SHELL.HELP', icon: 'life-buoy' },
  { id: 'settings', labelKey: 'SHELL.SETTINGS', icon: 'settings' },
];
