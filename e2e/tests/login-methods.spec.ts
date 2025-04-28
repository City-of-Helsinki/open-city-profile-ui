import { test, expect } from '@playwright/test';

import { fillSSNAndContinue } from '../utils/utils';
import { PROFILE_URL } from '../utils/constants';

const TEST_SSN = '081172-998T';

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  await page.goto(PROFILE_URL);
});

test('Login and logout - Swedish', async ({ page }) => {
  await page.getByRole('button', { name: 'Svenska' }).click();
  await page.getByLabel('Logga in').click();
  await page.getByRole('link', { name: 'Suomi.fi-identifikation' }).click();
  await page.getByRole('link', { name: 'Test IdP' }).click();
  await fillSSNAndContinue(page, TEST_SSN);
  await page.getByRole('button', { name: 'Fortsätt till tjänsten' }).click();
  await page.getByTestId('user-menu-button').click();
  await page.getByRole('button', { name: 'Logga ut' }).click();
  await expect(
    page.getByText('Din profilinformation på en adress!')
  ).toBeVisible();
});

test('Login and logout - English', async ({ page }) => {
  await page.getByRole('button', { name: 'English' }).click();
  await page.getByLabel('Log in').click();
  await page.getByRole('link', { name: 'Suomi.fi identification' }).click();
  await page.getByRole('link', { name: 'Test IdP' }).click();
  await fillSSNAndContinue(page, TEST_SSN);
  await page.getByRole('button', { name: 'Continue to service' }).click();
  await page.getByTestId('user-menu-button').click();
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(
    page.getByText('Your profile information at one address!')
  ).toBeVisible();
});
