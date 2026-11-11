import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

export type BadgeTone =
  'neutral' | 'brand' | 'danger' | 'success' | 'warning' | 'info';
export type BadgeSize = 'md' | 'sm';
export type BadgeVariant = 'solid' | 'soft' | 'outline';

/**
 * Small status/label pill. Covers the "chip" case too — the `--pill` radius and
 * the tone are the only things that differed between the two in this codebase.
 */
@Component({
  selector: 'lib-badge',
  template: '<ng-content />',
  styleUrl: './badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses()' },
})
export class BadgeComponent {
  readonly tone = input<BadgeTone>('neutral');
  readonly variant = input<BadgeVariant>('soft');
  /** Fully rounded, for tag-like usage. */
  readonly pill = input(false, { transform: booleanAttribute });
  /** `sm` is the design's 22px chip: 11px semibold text. */
  readonly size = input<BadgeSize>('md');

  protected readonly hostClasses = computed(() =>
    [
      'badge',
      `badge--${this.tone()}`,
      `badge--${this.variant()}`,
      this.pill() ? 'badge--pill' : '',
      `badge--${this.size()}`,
    ]
      .filter(Boolean)
      .join(' '),
  );
}
