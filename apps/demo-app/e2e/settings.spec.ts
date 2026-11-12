import { expect, test } from '@playwright/test';
import { seedSession } from './support/session';

/**
 * The settings feature end to end.
 *
 * The unit tests assert that the store forwards to `ThemeService` and
 * `UpdateLanguageService`. What they cannot assert is that the result reaches the
 * DOM and survives a reload — which is the entire point of these preferences.
 */
test.describe('settings', () => {
  test.beforeEach(async ({ page }) => {
    await seedSession(page, 'harbor');
    await page.goto('/settings');
    await expect(page.locator('lib-settings')).toBeVisible();
  });

  test('applies a theme choice to the document and persists it', async ({
    page,
  }) => {
    await page.getByRole('radio', { name: /dark/i }).click();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('switching language re-renders the page in that language', async ({
    page,
  }) => {
    await page.getByRole('radio', { name: /Nederlands/i }).click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  });

  test('language survives a reload', async ({ page }) => {
    await page.getByRole('radio', { name: /Nederlands/i }).click();

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
  });

  test('reduce motion toggles the document class and persists', async ({
    page,
  }) => {
    await page.getByRole('switch').click();

    await expect(page.locator('html')).toHaveClass(/reduce-motion/);

    await page.reload();
    await expect(page.locator('html')).toHaveClass(/reduce-motion/);
  });

  test('shows the workspace panel with the tenant name', async ({ page }) => {
    await expect(page.locator('lib-tenant-settings')).toBeVisible();
    await expect(page.getByText('Harbor', { exact: true }).first()).toBeVisible();
  });
});