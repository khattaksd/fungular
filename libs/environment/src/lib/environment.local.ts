import { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  environmentName: 'Local',
  // Same-origin: a real backend would sit behind the same origin in production;
  baseUrl: '',
};
