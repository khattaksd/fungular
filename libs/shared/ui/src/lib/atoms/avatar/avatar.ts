import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

export type AvatarSize = 'sm' | 'md' | 'lg';

/** "Alex Rivera" -> "AR", "Alex" -> "A", "" -> "?". */
export function initialsOf(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0));
  // First and last word only, so "Alex Marie Rivera" is "AR".
  const picked = [
    ...letters.slice(0, 1),
    ...(letters.length > 1 ? letters.slice(-1) : []),
  ];
  return picked.join('').toUpperCase() || '?';
}

/**
 * A person's photo, or their initials when there is none.
 *
 * Decorative: it is always rendered next to the person's name, so exposing it to
 * assistive technology would only read the name twice.
 */
@Component({
  selector: 'lib-avatar',
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"avatar avatar--" + size()',
    '[class.avatar--plain]': '!ring()',
    'aria-hidden': 'true',
  },
})
export class AvatarComponent {
  readonly name = input.required<string>();
  readonly src = input<string | null>(null);
  readonly size = input<AvatarSize>('md');
  /** The brand-coloured ring; the header's avatar has it, a list's does not. */
  readonly ring = input(true);

  protected readonly initials = computed(() => initialsOf(this.name()));
}
