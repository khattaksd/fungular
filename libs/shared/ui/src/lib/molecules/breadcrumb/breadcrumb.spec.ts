import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
import { BreadcrumbComponent } from './breadcrumb';

describe('BreadcrumbComponent', () => {
  let spectator: Spectator<BreadcrumbComponent>;
  const createComponent = createComponentFactory(BreadcrumbComponent);

  beforeEach(
    () =>
      (spectator = createComponent({
        props: {
          label: 'Your location',
          items: ['Grand Forks North', 'Line 4 · Shift B'],
        },
      })),
  );

  it('is a named navigation landmark', () => {
    expect(spectator.element).toHaveAttribute('role', 'navigation');
    expect(spectator.element).toHaveAttribute('aria-label', 'Your location');
  });

  it('lists each place and marks the last as the current location', () => {
    const items = spectator.queryAll('li');

    expect(items.map((li) => li.textContent?.trim())).toEqual([
      'Grand Forks North',
      'Line 4 · Shift B',
    ]);
    expect(items[0]).not.toHaveAttribute('aria-current');
    expect(items[1]).toHaveAttribute('aria-current', 'location');
  });
});
