import { expect, test, type Page } from '@playwright/test';

/**
 * The fake auth flow end to end: sign-in, the workspace chooser for
 * multi-tenant users, and tenant switching in the sidebar — which is also the
 * theme switch (tenants are the demo brands).
 */
test.describe('auth', () => {
  // A parameterless closure: expect.poll calls it with no arguments.
  const brandVar = (page: Page) => (): Promise<string> =>
    page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--color-brand')
        .trim(),
    );

  const login = async (page: Page, email: string): Promise<void> => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('anything');
    await page.getByRole('button', { name: 'Sign in' }).click();
  };

  test('a single-tenant login lands straight on the themed dashboard', async ({
    page,
  }) => {
    await login(page, 'single@example.com');

    await expect(page).toHaveURL(/\/$/);
    await expect.poll(brandVar(page), { timeout: 10_000 }).toBe('#b4531f'); // Solstice
  });

  test('a multi-tenant login goes through the chooser', async ({ page }) => {
    await login(page, 'alex@example.com');

    await expect(page).toHaveURL(/\/workspaces/);
    await page.getByRole('button', { name: /Harbor/ }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect.poll(brandVar(page), { timeout: 10_000 }).toBe('#0e7490'); // Harbor
    await expect(page.getByText('Dock Rebrand')).toBeVisible();
  });

  test('the sidebar switcher swaps the tenant and the entire dataset', async ({
    page,
  }) => {
    await login(page, 'alex@example.com');
    await page.getByRole('button', { name: /Harbor/ }).click();
    await expect(page.getByText('Dock Rebrand')).toBeVisible();

    // Switch to Meadow via the sidebar's workspace switcher.
    await page.locator('.nav__workspace-trigger').click();
    await page.getByRole('menuitem', { name: 'Meadow' }).click();

    await expect.poll(brandVar(page), { timeout: 10_000 }).toBe('#3f6212'); // Meadow
    // Harbor data is gone, Meadow's is in.
    await expect(page.getByText('Dock Rebrand')).toHaveCount(0);
    await expect(page.getByText('Field Notes')).toBeVisible();
  });

  test('logout returns to the login page', async ({ page }) => {
    await login(page, 'alex@example.com');
    await expect(page).toHaveURL(/\/workspaces/);

    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});