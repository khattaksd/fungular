import { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  environmentName: 'Local',
  // Same-origin: a real backend would sit behind the same origin in production;
  baseUrl: '',
  posthogProjectToken: import.meta.env.NG_APP_POSTHOG_PROJECT_TOKEN,
  posthogHost: import.meta.env.NG_APP_POSTHOG_HOST,
};
