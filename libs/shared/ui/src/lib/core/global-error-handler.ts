import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ANALYTICS } from '@libs/analytics';

/**
 * Reports uncaught errors to analytics instead of letting them vanish into the
 * console, then rethrows to the default handler so local debugging is unchanged.
 *
 * Depends on the `ANALYTICS` contract, not on any vendor SDK — with no analytics
 * provider registered this quietly reports into `NoopAnalytics`.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly analytics = inject(ANALYTICS);
  private readonly fallback = new ErrorHandler();

  handleError(error: unknown): void {
    this.analytics.logException(error);
    this.fallback.handleError(error);
  }
}
