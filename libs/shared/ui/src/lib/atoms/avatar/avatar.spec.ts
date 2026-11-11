import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
import { AvatarComponent, initialsOf } from './avatar';

describe('initialsOf', () => {
  it('uses the first letter of a single name', () => {
    expect(initialsOf('Alex')).toBe('A');
    expect(initialsOf('dana')).toBe('D');
  });

  it('uses the first and last words, however many there are', () => {
    expect(initialsOf('Alex Rivera')).toBe('AR');
    expect(initialsOf('Alex Marie Rivera')).toBe('AR');
    expect(initialsOf('  Leo   Nguyen ')).toBe('LN');
  });

  it('falls back to a placeholder for an empty name', () => {
    expect(initialsOf('')).toBe('?');
    expect(initialsOf('   ')).toBe('?');
  });
});

describe('AvatarComponent', () => {
  let spectator: Spectator<AvatarComponent>;
  const createComponent = createComponentFactory(AvatarComponent);

  it('shows the initials when there is no photo', () => {
    spectator = createComponent({ props: { name: 'Alex Rivera' } });

    expect(spectator.query('.avatar__initials')).toHaveText('AR');
    expect(spectator.query('img')).toBeNull();
  });

  it('shows the photo, decoratively, when there is one', () => {
    spectator = createComponent({
      props: { name: 'Alex Rivera', src: '/alex.png' },
    });

    const image = spectator.query('img');
    expect(image).toHaveAttribute('src', '/alex.png');
    expect(image).toHaveAttribute('alt', '');
    expect(spectator.query('.avatar__initials')).toBeNull();
  });

  it('is hidden from assistive technology and sized by input', () => {
    spectator = createComponent({ props: { name: 'Alex', size: 'lg' } });

    expect(spectator.element).toHaveAttribute('aria-hidden', 'true');
    expect(spectator.element).toHaveClass('avatar--lg');
  });

  it('has a brand ring unless asked not to', () => {
    spectator = createComponent({ props: { name: 'Alex Rivera' } });
    expect(spectator.element).not.toHaveClass('avatar--plain');

    spectator.setInput('ring', false);
    expect(spectator.element).toHaveClass('avatar--plain');
  });
});
