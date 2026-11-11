import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IconComponent, IconName } from '../icon/icon';

/**
 * A prominent message with optional actions. The tint and border follow the
 * `--color-*` tokens.
 *
 * Project the message as content and any buttons into `[banner-actions]`.
 */
@Component({
  selector: 'lib-banner',
  imports: [IconComponent],
  templateUrl: './banner.html',
  styleUrl: './banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'region', '[attr.aria-label]': 'heading()' },
})
export class BannerComponent {
  readonly heading = input.required<string>();
  readonly icon = input<IconName>('sparkle');
  /** Show a dismiss button. */
  readonly dismissible = input(false);
  /** Accessible name for the dismiss button; supply it translated. */
  readonly dismissLabel = input('');

  readonly dismissed = output<void>();
}
