import { Component } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
import { SectionHeaderComponent } from './section-header';

@Component({
  imports: [SectionHeaderComponent],
  template: `
    <lib-section-header heading="Today's priorities"
      ><a href="#all">All</a></lib-section-header
    >
  `,
})
class HostComponent {}

describe('SectionHeaderComponent', () => {
  let spectator: Spectator<HostComponent>;
  const createComponent = createComponentFactory(HostComponent);

  beforeEach(() => (spectator = createComponent()));

  it('renders the heading as an h2', () => {
    expect(spectator.query('h2')).toHaveText("Today's priorities");
  });

  it('projects an action beside the heading', () => {
    expect(spectator.query('.section__action a')).toHaveText('All');
  });
});
