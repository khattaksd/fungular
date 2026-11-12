import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { environment } from '@libs/environment';
import type posthog from 'posthog-js';
import type { LogAttributes } from 'posthog-js';
import { Analytics } from './analytics';

@Injectable({ providedIn: 'root' })
export class PostHogService implements Analytics {
  private readonly platformId = inject(PLATFORM_ID);
  private client?: typeof posthog;
  private initialized = false;
  private initialization?: Promise<void>;

  initialize(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this.initialized) {
      return Promise.resolve();
    }

    if (this.initialization) {
      return this.initialization;
    }

    this.initialization = this.initializeClient().catch((error: unknown) => {
      this.initialization = undefined;
      console.error('PostHog initialization failed', error);
    });
    return this.initialization;
  }

  identifyUser(
    userId: string,
    personProperties: Record<string, unknown>,
  ): void {
    this.withClient((client) => client.identify(userId, personProperties));
  }

  logEvent(eventName: string, params?: Record<string, unknown>): void {
    this.withClient((client) => client.capture(eventName, params));
  }

  // Sole PostHog Logs path, deliberately separate from the app's console output.
  logInfo(message: string, attributes?: Record<string, unknown>): void {
    this.withClient((client) =>
      // PostHog accepts nested objects/arrays; only top-level values narrow from `unknown`.
      client.logger.info(message, attributes as LogAttributes | undefined),
    );
  }

  logException(error: unknown): void {
    this.withClient((client) => client.captureException(error));
  }

  logPageView(pagePath: string, pageTitle?: string): void {
    this.withClient((client) =>
      client.capture('$pageview', {
        $current_url: window.location.href,
        page_path: pagePath,
        page_title: pageTitle,
      }),
    );
  }

  resetUser(): void {
    this.withClient((client) => client.reset());
  }

  private withClient(action: (client: typeof posthog) => void): void {
    if (this.client) {
      action(this.client);
      return;
    }

    void this.initialize().then(() => {
      if (this.client) action(this.client);
    });
  }

  private async initializeClient(): Promise<void> {
    if (!environment.posthogProjectToken) {
      if (!environment.production) {
        console.error(
          'posthogProjectToken required by PostHog is missing or un-configured in the environment files, this causes events to be silently missed. This error stops appearing once posthogProjectToken is configured',
        );
      }
      return;
    }

    if (!environment.posthogHost) {
      if (!environment.production) {
        console.error(
          'posthogHost required by PostHog is missing or un-configured in the environment files, this causes events to be silently missed. This error stops appearing once posthogHost is configured',
        );
      }
      return;
    }

    const { default: posthog } = await import('posthog-js');
    posthog.init(environment.posthogProjectToken, {
      api_host: environment.posthogHost,
      capture_exceptions: true,
      logs: {
        serviceName: 'fungular-web',
        environment: environment.production ? 'production' : 'development',
      },
    });
    this.client = posthog;
    this.initialized = true;
  }
}
