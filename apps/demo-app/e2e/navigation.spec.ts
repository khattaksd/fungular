import { expect, test } from '@playwright/test';
import { seedSession } from './support/session';

/**
 * Routing, auth guards, lazy loading and the 404 fallback.
 *
 * These are the parts a unit test can only assert trivially: `loadChildren`
 * declarations, `canActivate` guards and whether a chunk actually resolves
 * depends on the build, not on the declaration.
 */
test.describe('navigation', () => {
  test.beforeEach(async ({ page }) => {
    await seedSession(page, 'harbor');
  });

  test('renders the dashboard for a signed-in user', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  });

  test('sends a signed-out user from a tenant page to the login page', async ({
    page,
  }) => {
    // No seed in this test on purpose: the guard must catch a fresh visitor.
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/billing');

    await expect(page).toHaveURL(/\/login/);
  });

  test('lazy-loads the profile feature', async ({ page }) => {
    await page.goto('/profile');

    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.locator('lib-profile')).toBeVisible();
  });

  test('lazy-loads the settings feature', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.locator('lib-settings')).toBeVisible();
    await expect(page.getByRole('radiogroup')).toHaveCount(2);
  });

  test('falls back to the not-found page for an unknown route', async ({
    page,
  }) => {
    await page.goto('/this-route-does-not-exist');

    // A hosting rewrite that is misconfigured returns the raw 404 of the host
    // instead of the app — which is exactly what this catches on a deployed run.
    await expect(page.locator('app-root')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('sets a translated document title per route', async ({ page }) => {
    // Wait for the exact translated titles rather than a "not the placeholder"
    // guard: reading page.title() right after goto can race the TitleStrategy.
    // toHaveTitle retries until the route's own title lands. APP_TITLE is
    // 'fungular'; the dashboard route has no title so it falls back to that
    // alone.
    await page.goto('/');
    await expect(page).toHaveTitle('fungular');

    await page.goto('/settings');
    await expect(page).toHaveTitle('Settings · fungular'); // SETTINGS.TITLE
  });
});