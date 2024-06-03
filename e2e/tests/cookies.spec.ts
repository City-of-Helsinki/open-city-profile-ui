import { test, expect } from '@playwright/test';

import { PROFILE_URL } from '../utils/constants';

test.beforeEach(async ({ page }) => {
  await page.goto(PROFILE_URL);
  await expect(page.locator('#cookie-consent-content')).toBeVisible();
});

test.afterEach(async ({ page }) => {
  await expect(page.locator('#cookie-consent-content')).toBeHidden();
});

test('Cookie dialog is hidden after approving all cookies', async ({
  page,
}) => {
  await page.getByTestId('cookie-consent-approve-button').click();
});

test('Cookie dialog is hidden after approving only required cookies', async ({
  page,
}) => {
  await page.getByTestId('cookie-consent-approve-required-button').click();
});
