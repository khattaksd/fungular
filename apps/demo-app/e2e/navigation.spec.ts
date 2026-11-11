import { expect, test } from '@playwright/test';

/**
 * Routing, lazy loading and the 404 fallback.
 *
 * These are the parts a unit test can only assert trivially: `pages.routes.ts`
 * declares a `loadChildren`, and whether that chunk actually resolves depends on
 * the build, not on the declaration.
 */
test.describe('navigation', () => {
  test('renders the home page', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page).toHaveTitle(/.+/);
  });

  test('lazy-loads the profile feature', async ({ page }) => {
    await page.goto('/profile');

    await expect(page).toHaveURL(/\/profile$/);
    // Either the loaded profile or its error state — the API is not running in CI.
    // Both prove the lazy chunk resolved and the route's providers were created.
    await expect(page.locator('lib-profile')).toBeVisible();
  });

  test('lazy-loads the settings feature', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.locator('lib-settings')).toBeVisible();
    await expect(page.getByRole('radiogroup')).toHaveCount(2);
  });

  test('demo brands re-theme the page from the URL and from the switcher', async ({
    page,
  }) => {
    const brandVar = () =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--color-brand')
          .trim(),
      );

    // `?brand=` is applied at startup (the app initializer fetches the JSON),
    // and the switcher applies one without a reload. The 10s poll covers a
    // cold first run where branding loads at the far end of its 3s timeout.
    await page.goto('/?brand=harbor');
    await expect.poll(brandVar, { timeout: 10_000 }).toBe('#0e7490');

    await page.getByRole('button', { name: 'Meadow' }).click();
    await expect.poll(brandVar, { timeout: 10_000 }).toBe('#3f6212');
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
    // 'fungular'; the home route has no title so it falls back to that alone.
    await page.goto('/');
    await expect(page).toHaveTitle('fungular');

    await page.goto('/settings');
    await expect(page).toHaveTitle('Settings · fungular'); // SETTINGS.TITLE
  });
});
