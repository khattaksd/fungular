import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
import { ProgressComponent } from './progress';

describe('ProgressComponent', () => {
  let spectator: Spectator<ProgressComponent>;
  const createComponent = createComponentFactory(ProgressComponent);

  const bar = () => spectator.query('[role="progressbar"]') as HTMLElement;
  const fill = () => spectator.query('.progress__fill') as HTMLElement;

  it('exposes its value and name to assistive technology', () => {
    spectator = createComponent({ props: { value: 50, label: 'Course' } });

    expect(bar()).toHaveAttribute('aria-valuenow', '50');
    expect(bar()).toHaveAttribute('aria-label', 'Course');
    expect(fill().style.width).toBe('50%');
  });

  it.each([
    [-20, 0],
    [140, 100],
    [33.4, 33],
    [Number.NaN, 0],
  ])('treats %s as %s%%', (value, expected) => {
    spectator = createComponent({ props: { value, label: 'Course' } });

    expect(bar()).toHaveAttribute('aria-valuenow', String(expected));
  });

  it('shows no text row unless asked', () => {
    spectator = createComponent({ props: { value: 50, label: 'Course' } });

    expect(spectator.query('.progress__meta')).toBeNull();
  });

  it('shows the caption and percentage when given', () => {
    spectator = createComponent({
      props: {
        value: 50,
        label: 'Course',
        caption: 'Section 2 of 4',
        showValue: true,
      },
    });

    expect(spectator.query('.progress__meta')).toHaveText('Section 2 of 4');
    expect(spectator.query('.progress__meta')).toHaveText('50%');
  });
});
