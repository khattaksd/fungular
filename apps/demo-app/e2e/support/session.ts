import type { Page } from '@playwright/test';

const TENANTS = [
  { id: 'solstice', name: 'Solstice', logo: './assets/brands/solstice-logo.svg', role: 'Owner' },
  { id: 'harbor', name: 'Harbor', logo: './assets/brands/harbor-logo.svg', role: 'Admin' },
  { id: 'meadow', name: 'Meadow', logo: './assets/brands/meadow-logo.svg', role: 'Member' },
];

/**
 * A pasted session for "already signed in" specs. Seed it before `goto` so the
 * app restores it from localStorage at boot — the same path a reload takes.
 */
export async function seedSession(
  page: Page,
  currentTenantId: string | null,
): Promise<void> {
  const session = JSON.stringify({
    token: 'mock-token',
    user: { id: 'u-alex', name: 'Alex Rivera', email: 'alex@example.com' },
    tenants: TENANTS,
    currentTenantId,
  });
  await page.addInitScript((value) => {
    try {
      localStorage.setItem('fungular.session', value);
    } catch {
      // Storage unavailable — the app simply starts signed out.
    }
  }, session);
}