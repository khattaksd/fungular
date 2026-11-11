import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../atoms/button/button';
import { IconComponent, IconName } from '../../atoms/icon/icon';

/**
 * A card-like row: icon tile, title and meta line, an optional status chip and an
 * arrow. With a `route` the whole row is the link (the arrow is the link's visible
 * part, stretched over the row); without one it is plain content.
 *
 * Project a status chip into `[row-status]`.
 */
@Component({
  selector: 'lib-list-row',
  imports: [RouterLink, ButtonComponent, IconComponent],
  templateUrl: './list-row.html',
  styleUrl: './list-row.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListRowComponent {
  readonly icon = input.required<IconName>();
  readonly heading = input.required<string>();
  readonly meta = input<string | null>(null);
  readonly route = input<string | null>(null);
}
