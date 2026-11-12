/**
 * Shape every environment file must satisfy. Typing them all against this stops
 * the variants from drifting apart — a missing key is now a compile error in the
 * configuration that uses it, not a surprise at build time.
 */
export interface Environment {
  production: boolean;
  environmentName: string;
  baseUrl: string;
  posthogProjectToken?: string;
  posthogHost?: string;
}

/** Ambient typing so `import.meta.env` reads type-check in any program importing this module. */
declare global {
  interface ImportMetaEnv {
    readonly NG_APP_POSTHOG_PROJECT_TOKEN?: string;
    readonly NG_APP_POSTHOG_HOST?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
