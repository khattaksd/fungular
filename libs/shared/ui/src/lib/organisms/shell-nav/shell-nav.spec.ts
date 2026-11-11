import { Component } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
import {
  TranslateLoader,
  TranslationObject,
  provideTranslateService,
} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { ShellNavComponent, ShellNavItem } from './shell-nav';

@Component({ template: '' })
class BlankPage {}

class StubTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<TranslationObject> {
    return of({
      SHELL: {
        WORKPLACE: 'Your workplace',
        COLLAPSE: 'Collapse navigation',
        EXPAND: 'Expand navigation',
        UNAVAILABLE: 'Coming soon',
        NAV_ARIA: 'Main navigation',
      },
    });
  }
}

const ITEMS: ShellNavItem[] = [
  {
    id: 'today',
    labelKey: 'NAV.TODAY',
    icon: 'home',
    route: '/',
    exact: true,
    badge: 2,
  },
  { id: 'records', labelKey: 'NAV.RECORDS', icon: 'files', route: '/records' },
  { id: 'library', labelKey: 'NAV.LIBRARY', icon: 'book' },
];

describe('ShellNavComponent', () => {
  let spectator: Spectator<ShellNavComponent>;
  const createComponent = createComponentFactory({
    component: ShellNavComponent,
    providers: [
      provideRouter([
        { path: '', component: BlankPage },
        { path: 'records', component: BlankPage },
      ]),
      provideTranslateService({
        loader: [{ provide: TranslateLoader, useClass: StubTranslateLoader }],
        lang: 'en',
        fallbackLang: 'en',
      }),
    ],
  });

  it('renders a link for a destination with a route and a badge when there is a count', () => {
    spectator = createComponent({ props: { items: ITEMS } });

    expect(spectator.queryAll('a.nav__link')).toHaveLength(2);
    expect(spectator.query('.nav__badge')).toHaveText('2');
  });

  it('renders a destination without a route as unavailable, not as a link', () => {
    spectator = createComponent({ props: { items: ITEMS } });

    const unavailable = spectator.query('.nav__link--unavailable');
    expect(unavailable?.tagName).toBe('SPAN');
    expect(unavailable).toHaveAttribute('aria-disabled', 'true');
    expect(unavailable).toHaveAttribute('title', 'Coming soon');
  });

  it('marks the current page, even with a query string on the URL', async () => {
    spectator = createComponent({ props: { items: ITEMS } });
    const router = spectator.inject(Router);

    // `exact` used to compare query params too, so `/?tab=1` never matched `/`.
    await router.navigateByUrl('/?tab=1');
    spectator.detectChanges();

    const active = spectator.query('.nav__link--active');
    expect(active).toHaveText('NAV.TODAY');
    expect(active).toHaveAttribute('aria-current', 'page');
  });

  it('keeps an exact item inactive on a deeper route', async () => {
    spectator = createComponent({ props: { items: ITEMS } });

    await spectator.inject(Router).navigateByUrl('/records');
    spectator.detectChanges();

    expect(spectator.queryAll('.nav__link--active')).toHaveLength(1);
    expect(spectator.query('.nav__link--active')).toHaveText('NAV.RECORDS');
  });

  it('tells the shell when a destination is chosen', () => {
    spectator = createComponent({ props: { items: ITEMS } });
    const navigated = vi.fn();
    spectator.component.navigated.subscribe(navigated);

    spectator.click('a.nav__link');

    expect(navigated).toHaveBeenCalledTimes(1);
  });

  it('becomes a rail when collapsed: no section label', () => {
    spectator = createComponent({
      props: { items: ITEMS, collapsed: true },
    });

    expect(spectator.element).toHaveClass('collapsed');
    expect(spectator.query('.nav__section')).toBeNull();
  });

  it('labels the collapse button for its next action and reports its state', () => {
    spectator = createComponent({ props: { items: ITEMS } });
    const toggled = vi.fn();
    spectator.component.collapseToggled.subscribe(toggled);

    const button = spectator.query('.nav__collapse');
    expect(button).toHaveAttribute('aria-label', 'Collapse navigation');
    expect(button).toHaveAttribute('aria-expanded', 'true');

    spectator.click('.nav__collapse');
    expect(toggled).toHaveBeenCalledTimes(1);

    spectator.setInput('collapsed', true);
    expect(spectator.query('.nav__collapse')).toHaveAttribute(
      'aria-label',
      'Expand navigation',
    );
    expect(spectator.query('.nav__collapse')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('renders the footer items', () => {
    spectator = createComponent({
      props: {
        items: ITEMS,
        footerItems: [
          {
            id: 'settings',
            labelKey: 'NAV.SETTINGS',
            icon: 'settings',
            route: '/records',
          },
        ],
      },
    });

    expect(spectator.queryAll('.nav__foot a.nav__link')).toHaveLength(1);
  });
});
