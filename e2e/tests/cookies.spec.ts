import { test, expect } from '@playwright/test';

import { PROFILE_URL } from '../utils/constants';

test.beforeEach(async ({ page }) => {
  await page.goto(PROFILE_URL);

  const title = page.getByRole('heading', {
    name: 'Profiili käyttää evästeitä',
  });
  await expect(title).toBeVisible();
});

test.afterEach(async ({ page }) => {
  const title = page.getByRole('heading', {
    name: 'Profiili käyttää evästeitä',
  });
  await expect(title).toBeHidden();
});

test('Cookie dialog is hidden after approving all cookies', async ({
  context,
  page,
}) => {
  await page.getByRole('button', { name: 'Hyväksy kaikki evästeet' }).click();

  const cookies = await context.cookies();
  const myCookie = cookies.find(
    cookie => cookie.name === 'city-of-helsinki-cookie-consents'
  );
  expect(myCookie?.value).toContain('statistics');
});

test('Cookie dialog is hidden after approving only required cookies', async ({
  context,
  page,
}) => {
  await page
    .getByRole('button', { name: 'Hyväksy vain välttämättömät evästeet' })
    .click();

  const cookies = await context.cookies();
  const myCookie = cookies.find(
    cookie => cookie.name === 'city-of-helsinki-cookie-consents'
  );
  expect(myCookie?.value).not.toContain('statistics');
});
