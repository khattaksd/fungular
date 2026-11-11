import { Component, signal } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
import { BannerComponent } from './banner';

@Component({
  imports: [BannerComponent],
  template: `
    <lib-banner
      heading="Since your last visit"
      [dismissible]="dismissible()"
      dismissLabel="Dismiss"
      (dismissed)="dismissals.set(dismissals() + 1)"
    >
      The procedure changed.
      <button banner-actions type="button">Review</button>
    </lib-banner>
  `,
})
class HostComponent {
  readonly dismissible = signal(false);
  readonly dismissals = signal(0);
}

describe('BannerComponent', () => {
  let spectator: Spectator<HostComponent>;
  const createComponent = createComponentFactory(HostComponent);

  beforeEach(() => (spectator = createComponent()));

  it('is a named region carrying its heading', () => {
    const banner = spectator.query('lib-banner') as HTMLElement;

    expect(banner).toHaveAttribute('role', 'region');
    expect(banner).toHaveAttribute('aria-label', 'Since your last visit');
    expect(spectator.query('.banner__heading')).toHaveText(
      'Since your last visit',
    );
  });

  it('projects the message and the actions', () => {
    expect(spectator.query('.banner__body')).toHaveText(
      'The procedure changed.',
    );
    expect(spectator.query('.banner__actions button')).toHaveText('Review');
  });

  it('has no dismiss button unless asked', () => {
    expect(spectator.query('.banner__dismiss')).toBeNull();
  });

  it('emits when dismissed, through a named button', () => {
    spectator.component.dismissible.set(true);
    spectator.detectChanges();
    const dismiss = spectator.query('.banner__dismiss') as HTMLElement;
    expect(dismiss).toHaveAttribute('aria-label', 'Dismiss');

    spectator.click(dismiss);

    expect(spectator.component.dismissals()).toBe(1);
  });
});
