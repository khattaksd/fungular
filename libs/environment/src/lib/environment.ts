import { Environment } from './environment.model';

export const environment: Environment = {
  production: true,
  environmentName: 'Production',
  // Same-origin: a real backend would sit behind the same origin in production;
  baseUrl: '',
  // Injected via @ngx-env at build time, never committed; missing values disable PostHog.
  posthogProjectToken: import.meta.env.NG_APP_POSTHOG_PROJECT_TOKEN,
  posthogHost: import.meta.env.NG_APP_POSTHOG_HOST,
};
