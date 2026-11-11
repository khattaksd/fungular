import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** A page section's `<h2>` in the display face, with an optional action on the far side. */
@Component({
  selector: 'lib-section-header',
  templateUrl: './section-header.html',
  styleUrl: './section-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeaderComponent {
  readonly heading = input.required<string>();
}
