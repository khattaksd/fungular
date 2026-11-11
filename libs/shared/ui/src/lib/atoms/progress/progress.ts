import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/** A determinate progress bar with an optional caption and percentage above it. */
@Component({
  selector: 'lib-progress',
  templateUrl: './progress.html',
  styleUrl: './progress.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressComponent {
  /** 0–100; out-of-range values are clamped. */
  readonly value = input.required<number>();
  /** Accessible name — what is progressing. */
  readonly label = input.required<string>();
  /** Text above the bar on the left, e.g. "Section 2 of 4". */
  readonly caption = input<string | null>(null);
  /** Show the percentage above the bar on the right. */
  readonly showValue = input(false);

  protected readonly percent = computed(() =>
    Math.round(Math.min(100, Math.max(0, this.value() || 0))),
  );
}
