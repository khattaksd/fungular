import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../../atoms/icon/icon';

/** Where the user is, as a trail of plain labels: "Grand Forks North / Line 4 · Shift B". */
@Component({
  selector: 'lib-breadcrumb',
  imports: [IconComponent],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'navigation', '[attr.aria-label]': 'label()' },
})
export class BreadcrumbComponent {
  /** Accessible name of the landmark, supplied translated. */
  readonly label = input.required<string>();
  readonly items = input.required<readonly string[]>();
}
