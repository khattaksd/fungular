import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
import { BadgeComponent } from '../../atoms/badge/badge';
import { ListRowComponent } from './list-row';

@Component({ template: '' })
class BlankPage {}

@Component({
  imports: [ListRowComponent, BadgeComponent],
  template: `
    <lib-list-row
      icon="book"
      heading="Complete your GMP refresher"
      meta="8 min"
      route="/learn"
    >
      <lib-badge row-status>Due</lib-badge>
    </lib-list-row>
    <lib-list-row id="static" icon="book" heading="Static row" />
  `,
})
class HostComponent {}

describe('ListRowComponent', () => {
  let spectator: Spectator<HostComponent>;
  const createComponent = createComponentFactory({
    component: HostComponent,
    providers: [provideRouter([{ path: 'learn', component: BlankPage }])],
  });

  beforeEach(() => (spectator = createComponent()));

  it('shows the title, meta line and projected status', () => {
    const row = spectator.query('lib-list-row') as HTMLElement;

    expect(row.querySelector('.row__title')).toHaveText(
      'Complete your GMP refresher',
    );
    expect(row.querySelector('.row__meta')).toHaveText('8 min');
    expect(row.querySelector('.row__status')).toHaveText('Due');
  });

  it('links the row, named by its title, when it has a route', () => {
    const link = spectator.query('lib-list-row a') as HTMLAnchorElement;

    expect(link).toHaveAttribute('href', '/learn');
    expect(link).toHaveAttribute('aria-label', 'Complete your GMP refresher');
  });

  it('is plain content, with no link and no meta, without a route', () => {
    const row = spectator.query('#static') as HTMLElement;

    expect(row.querySelector('a')).toBeNull();
    expect(row.querySelector('.row__meta')).toBeNull();
  });
});
