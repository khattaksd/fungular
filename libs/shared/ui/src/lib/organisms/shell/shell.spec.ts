import { Component, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { BrandTheme } from '@libs/theme';
import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
import {
  TranslateLoader,
  TranslationObject,
  provideTranslateService,
} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { Layout, ViewportService } from '../../core/viewport.service';
import { ShellNavItem } from '../shell-nav/shell-nav';
import { ShellComponent } from './shell';

@Component({ template: '' })
class BlankPage {}

class StubTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<TranslationObject> {
    return of({
      SHELL: {
        GREETING: 'Hi, {{name}}',
        POWERED_BY: 'Powered by',
      },
    });
  }
}

const ITEMS: ShellNavItem[] = [
  { id: 'home', labelKey: 'NAV.HOME', icon: 'home', route: '/' },
];

const BRAND: BrandTheme = {
  id: 'solstice',
  name: 'Solstice',
  tenantLabel: 'Our Solstice',
  tagline: 'Sunrise, engineered.',
  taglineSub: 'A demo brand.',
  logo: { url: '/logo.svg', alt: 'Solstice' },
  colors: {},
};

describe('ShellComponent', () => {
  let spectator: Spectator<ShellComponent>;
  const layout = signal<Layout>('desktop');
  const createComponent = createComponentFactory({
    component: ShellComponent,
    providers: [
      { provide: ViewportService, useValue: { layout } },
      provideRouter([{ path: '', component: BlankPage }]),
      provideTranslateService({
        loader: [{ provide: TranslateLoader, useClass: StubTranslateLoader }],
        lang: 'en',
        fallbackLang: 'en',
      }),
    ],
  });

  const openDrawer = async (): Promise<void> => {
    spectator = createComponent({
      props: {
        navItems: [
          ...ITEMS,
          { id: 'two', labelKey: 'NAV.TWO', icon: 'home', route: '/two' },
        ],
      },
      detectChanges: true,
    });
    // jsdom ignores the phone media query, and newer versions refuse to focus a display:none button.
    spectator
      .query<HTMLElement>('.bar__menu')
      ?.style.setProperty('display', 'inline-flex');
    spectator.click('.bar__menu');
    await spectator.fixture.whenStable();
  };

  const key = (target: Element, shiftKey = false): KeyboardEvent => {
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey,
      bubbles: true,
      cancelable: true,
    });
    target.dispatchEvent(event);
    return event;
  };

  beforeEach(() => layout.set('desktop'));

  it('hands the brand logo to the header', () => {
    spectator = createComponent({
      props: { navItems: ITEMS, brand: BRAND },
    });

    expect(spectator.query('.bar__logo img')).toHaveAttribute(
      'src',
      '/logo.svg',
    );
  });

  it('renders without a brand while one is loading or has failed to load', () => {
    spectator = createComponent({ props: { navItems: ITEMS } });

    expect(spectator.query('.bar__logo img')).toBeNull();
  });

  it('shows the brand tagline and platform mark when given', () => {
    spectator = createComponent({
      props: {
        navItems: ITEMS,
        brand: BRAND,
        platformLogo: { url: '/platform.svg', alt: 'fungular' },
      },
    });

    expect(spectator.query('.nav__tagline')).toHaveText(
      'Sunrise, engineered.',
    );
    expect(spectator.query('.nav__powered')).toHaveText('Powered by');
  });

  it('forwards the selected workspace from the switcher', () => {
    spectator = createComponent({
      props: {
        navItems: ITEMS,
        workspaces: [{ id: 'harbor', label: 'Harbor' }],
      },
    });

    const selected = vi.fn();
    spectator.component.workspaceSelected.subscribe(selected);

    spectator.click('.nav__workspace-trigger');
    spectator.click(spectator.query('.nav__workspace-menu button') as HTMLElement);

    expect(selected).toHaveBeenCalledWith('harbor');
  });

  it('projects the routed page into the content area', () => {
    spectator = createComponent({ props: { navItems: ITEMS } });

    expect(spectator.query('.shell__content')).toBeTruthy();
    // The routed pages bring their own <main>, so the shell must not add a second.
    expect(spectator.query('main')).toBeNull();
  });

  it('starts as a full sidebar on desktop and phone viewports', () => {
    spectator = createComponent({ props: { navItems: ITEMS } });

    expect(spectator.query('.shell')).not.toHaveClass('shell--collapsed');
  });

  it('starts as an icon rail on a tablet viewport', () => {
    layout.set('tablet');
    spectator = createComponent({ props: { navItems: ITEMS } });

    expect(spectator.query('.shell')).toHaveClass('shell--collapsed');
  });

  it('collapses and expands from the sidebar toggle', () => {
    spectator = createComponent({ props: { navItems: ITEMS } });

    spectator.click('.nav__collapse');
    expect(spectator.query('.shell')).toHaveClass('shell--collapsed');

    spectator.click('.nav__collapse');
    expect(spectator.query('.shell')).not.toHaveClass('shell--collapsed');
  });

  it('opens the phone drawer from the header and closes it from the scrim', () => {
    spectator = createComponent({ props: { navItems: ITEMS } });
    expect(spectator.query('.shell__scrim')).toBeNull();

    spectator.click('.bar__menu');
    expect(spectator.query('.shell')).toHaveClass('shell--drawer-open');
    expect(spectator.query('.shell__scrim')).toBeTruthy();

    spectator.click('.shell__scrim');
    expect(spectator.query('.shell')).not.toHaveClass('shell--drawer-open');
  });

  it('closes the drawer on Escape', () => {
    spectator = createComponent({ props: { navItems: ITEMS } });
    spectator.click('.bar__menu');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    spectator.detectChanges();

    expect(spectator.query('.shell')).not.toHaveClass('shell--drawer-open');
  });

  it('closes the drawer when a destination is chosen', () => {
    spectator = createComponent({ props: { navItems: ITEMS } });
    spectator.click('.bar__menu');

    spectator.click('a.nav__link');

    expect(spectator.query('.shell')).not.toHaveClass('shell--drawer-open');
  });

  describe('drawer accessibility', () => {
    it('moves focus into the navigation when the drawer opens', async () => {
      await openDrawer();

      expect(document.activeElement).toBe(
        spectator.query('.shell__nav button, .shell__nav a[href]'),
      );
    });

    it('makes the page behind the drawer inert while it is open', async () => {
      await openDrawer();
      expect(spectator.query('.shell__content')).toHaveAttribute('inert');

      spectator.click('.shell__scrim');
      expect(spectator.query('.shell__content')).not.toHaveAttribute('inert');
    });

    it('returns focus to the menu button when the drawer closes', async () => {
      await openDrawer();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await spectator.fixture.whenStable();

      expect(document.activeElement).toBe(spectator.query('.bar__menu'));
    });

    it('does not steal focus when a destination is chosen', async () => {
      await openDrawer();
      const link = spectator.query<HTMLElement>('.shell__nav a[href]');

      spectator.click(link as HTMLElement);
      await spectator.fixture.whenStable();

      expect(document.activeElement).not.toBe(spectator.query('.bar__menu'));
    });

    it('wraps Tab from the last navigation item to the menu button', async () => {
      await openDrawer();
      const links = spectator.queryAll<HTMLElement>(
        '.shell__nav a[href], .shell__nav button',
      );
      links.at(-1)?.focus();

      const event = key(links.at(-1) as HTMLElement);

      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(spectator.query('.bar__menu'));
    });

    it('wraps Shift+Tab from the menu button to the last navigation item', async () => {
      await openDrawer();
      const links = spectator.queryAll<HTMLElement>(
        '.shell__nav a[href], .shell__nav button',
      );
      const menu = spectator.query<HTMLElement>('.bar__menu') as HTMLElement;
      menu.focus();

      const event = key(menu, true);

      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(links.at(-1));
    });

    it('leaves Tab alone when the drawer is closed or focus is mid-list', async () => {
      spectator = createComponent({ props: { navItems: ITEMS } });
      const menu = spectator.query('.bar__menu') as HTMLElement;
      expect(key(menu).defaultPrevented).toBe(false);

      await openDrawer();
      const first = spectator.query<HTMLElement>('.shell__nav a[href]');
      first?.focus();
      expect(key(first as HTMLElement).defaultPrevented).toBe(false);
    });
  });

  describe('viewport changes', () => {
    it('closes the drawer when the window grows past phone width', async () => {
      layout.set('phone');
      await openDrawer();
      expect(spectator.query('.shell')).toHaveClass('shell--drawer-open');

      layout.set('desktop');
      spectator.detectChanges();

      expect(spectator.query('.shell')).not.toHaveClass('shell--drawer-open');
    });

    it('keeps the drawer open while the window stays phone width', async () => {
      layout.set('phone');
      await openDrawer();

      spectator.detectChanges();

      expect(spectator.query('.shell')).toHaveClass('shell--drawer-open');
    });

    it('collapses to a rail on entering tablet width and expands on leaving it', () => {
      spectator = createComponent({ props: { navItems: ITEMS } });

      layout.set('tablet');
      spectator.detectChanges();
      expect(spectator.query('.shell')).toHaveClass('shell--collapsed');

      layout.set('desktop');
      spectator.detectChanges();
      expect(spectator.query('.shell')).not.toHaveClass('shell--collapsed');
    });
  });
});
