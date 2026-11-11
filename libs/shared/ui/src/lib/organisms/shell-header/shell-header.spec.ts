import { provideRouter } from '@angular/router';
import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
import {
  TranslateLoader,
  TranslationObject,
  provideTranslateService,
} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { ShellHeaderComponent } from './shell-header';

class StubTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<TranslationObject> {
    return of({
      SHELL: {
        GREETING: 'Hi, {{name}}',
        OPEN_MENU: 'Open navigation',
        CLOSE_MENU: 'Close navigation',
        NOTIFICATIONS_ARIA: 'Notifications',
        NOTIFICATIONS_UNREAD: 'You have unread notifications',
        SEARCH_PLACEHOLDER: 'Start typing to search…',
        SEARCH_ARIA: 'Search',
      },
    });
  }
}

describe('ShellHeaderComponent', () => {
  let spectator: Spectator<ShellHeaderComponent>;
  const createComponent = createComponentFactory({
    component: ShellHeaderComponent,
    providers: [
      provideRouter([]),
      provideTranslateService({
        loader: [{ provide: TranslateLoader, useClass: StubTranslateLoader }],
        lang: 'en',
        fallbackLang: 'en',
      }),
    ],
  });

  it('is the page banner landmark', () => {
    spectator = createComponent();

    expect(spectator.query('header')).toBeTruthy();
  });

  it("shows the app's logo in the reserved panel", () => {
    spectator = createComponent({
      props: { logo: { url: '/fungular.svg', alt: 'fungular' } },
    });

    const image = spectator.query('.bar__logo img');
    expect(image).toHaveAttribute('src', '/fungular.svg');
    expect(image).toHaveAttribute('alt', 'fungular');
  });

  it('reserves the panel without an image when there is no logo', () => {
    spectator = createComponent();

    expect(spectator.query('.bar__logo')).toBeTruthy();
    expect(spectator.query('.bar__logo img')).toBeNull();
  });

  it('names the user and links to their settings', () => {
    spectator = createComponent({ props: { userName: 'Alex' } });

    const user = spectator.query('a.bar__user');
    expect(user).toHaveText('Hi, Alex');
    expect(user).toHaveAttribute('href', '/settings');
  });

  it('marks unread notifications visually and for screen readers', () => {
    spectator = createComponent({ props: { hasUnread: true } });

    expect(spectator.query('.bar__dot')).toBeTruthy();
    expect(spectator.query('.visually-hidden')).toHaveText(
      'You have unread notifications',
    );
  });

  it('shows no unread marker when everything has been read', () => {
    spectator = createComponent({ props: { hasUnread: false } });

    expect(spectator.query('.bar__dot')).toBeNull();
    expect(spectator.query('.visually-hidden')).toBeNull();
  });

  it('gives every icon-only button an accessible name', () => {
    spectator = createComponent();

    const buttons = spectator.queryAll('button');
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((button) =>
      expect(button.getAttribute('aria-label')).toBeTruthy(),
    );
  });

  it('has a labelled search field', () => {
    spectator = createComponent();

    expect(spectator.query('form[role="search"]')).toBeTruthy();
    expect(spectator.query('input[type="search"]')).toHaveAttribute(
      'aria-label',
      'Search',
    );
  });

  it('offers the navigation drawer and reports whether it is open', () => {
    spectator = createComponent();
    const toggled = vi.fn();
    spectator.component.menuToggled.subscribe(toggled);

    const menu = spectator.query('.bar__menu');
    expect(menu).toHaveAttribute('aria-label', 'Open navigation');
    expect(menu).toHaveAttribute('aria-expanded', 'false');

    spectator.click('.bar__menu');
    expect(toggled).toHaveBeenCalledTimes(1);

    spectator.setInput('menuOpen', true);
    expect(spectator.query('.bar__menu')).toHaveAttribute(
      'aria-label',
      'Close navigation',
    );
    expect(spectator.query('.bar__menu')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('does not reload the page when search is submitted', () => {
    spectator = createComponent();
    const event = new Event('submit', { cancelable: true });

    spectator.query('form')?.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });
});
