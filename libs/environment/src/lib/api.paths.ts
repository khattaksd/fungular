export const commonPaths = {
  profile: {
    // The profile contract: `{ data: { id, name } }`. Served by the mock API
    // until a real backend exists.
    current: '/api/v1/profile',
  },
};

/**
 * Demo brands are static JSON under `assets/brands/`. Relative on purpose (no
 * leading slash), like the i18n loader, so the app still works when it is served
 * under a sub-path.
 */
export const brandPaths = {
  byBrand: (brand: string): string => `./assets/brands/${brand}.json`,
};
