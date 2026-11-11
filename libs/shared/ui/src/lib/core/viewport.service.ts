import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, Signal, inject, signal } from '@angular/core';

export type Layout = 'phone' | 'tablet' | 'desktop';

const PHONE_QUERY = '(max-width: 600px)';
const TABLET_QUERY = '(min-width: 601px) and (max-width: 1023px)';

/**
 * Which of the design's three layouts the window is in, kept current on resize and
 * rotate. Breakpoints are the design's, not Tailwind's. Outside a browser (and in
 * jsdom, which has no `matchMedia`) it reports `desktop`.
 */
@Injectable({ providedIn: 'root' })
export class ViewportService {
  private readonly _layout = signal<Layout>('desktop');
  readonly layout: Signal<Layout> = this._layout.asReadonly();

  constructor() {
    const view = inject(DOCUMENT).defaultView;
    if (typeof view?.matchMedia !== 'function') return;

    const phone = view.matchMedia(PHONE_QUERY);
    const tablet = view.matchMedia(TABLET_QUERY);
    const update = (): void =>
      this._layout.set(
        phone.matches ? 'phone' : tablet.matches ? 'tablet' : 'desktop',
      );

    update();
    phone.addEventListener?.('change', update);
    tablet.addEventListener?.('change', update);
    inject(DestroyRef).onDestroy(() => {
      phone.removeEventListener?.('change', update);
      tablet.removeEventListener?.('change', update);
    });
  }
}
