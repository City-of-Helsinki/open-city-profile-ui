import { test, expect } from '@playwright/test';

import { clickLoginButton, fillSSNAndContinue } from '../utils/utils';
import { PROFILE_URL } from '../utils/constants';

const TEST_SSN = '081172-998T';

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  await page.goto(PROFILE_URL);
});

test('Login and logout - Swedish', async ({ page }) => {
  await page.getByRole('button', { name: 'Svenska' }).click();
  await page.getByRole('button', { name: 'Logga in' }).click();
  await page.getByRole('link', { name: 'Suomi.fi-identifikation' }).click();
  await page.getByRole('link', { name: 'Test IdP' }).click();
  await fillSSNAndContinue(page, TEST_SSN);
  await Promise.all([
    page.waitForURL(PROFILE_URL),
    page.getByRole('button', { name: 'Fortsätt till tjänsten' }).click(),
  ]);
  await expect(
    page.getByRole('heading', { name: 'Min information' })
  ).toBeVisible();
  await page.getByLabel('Profilmeny').click();
  await page.getByRole('link', { name: 'Logga ut' }).click();
  await expect(
    page.getByText('Du har loggats ut från Helsingfors stads e-tjänst')
  ).toBeVisible();
});

test('Login and logout - English', async ({ page }) => {
  await page.getByRole('button', { name: 'English' }).click();
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('link', { name: 'Suomi.fi e-Identification' }).click();
  await page.getByRole('link', { name: 'Test IdP' }).click();
  await fillSSNAndContinue(page, TEST_SSN);
  await Promise.all([
    page.waitForURL(PROFILE_URL),
    page.getByRole('button', { name: 'Continue to service' }).click(),
  ]);
  await expect(
    page.getByRole('heading', { name: 'My information' })
  ).toBeVisible();
  await page.getByLabel('Profile menu').click();
  await page.getByRole('link', { name: 'Sign out' }).click();
  await expect(
    page.getByText('You have been logged out of City of Helsinki services')
  ).toBeVisible();
});

test('Login with YLE account', async ({ page }) => {
  const YLE_ACCOUNT_NAME = 'Emeritus Tarmo';
  const YLE_ACCOUNT_EMAIL = 'tarmotestaaja007@gmail.com';
  const YLE_ACCOUNT_PASSWORD = '1qaz2wsx3edc';

  await clickLoginButton(page);
  await page.getByRole('link', { name: 'Yle Tunnus' }).click();
  await page.getByLabel('Vain välttämättömät').click();
  await page.getByLabel('Sähköposti').fill(YLE_ACCOUNT_EMAIL);
  await page.getByLabel('Salasana', { exact: true }).fill(YLE_ACCOUNT_PASSWORD);
  await Promise.all([
    page.waitForURL(PROFILE_URL),
    page.getByLabel('Kirjaudu sisään').click(),
  ]);
  await expect(
    page.getByRole('heading', { name: 'Omat tiedot' })
  ).toBeVisible();
  await expect(page.getByTestId('basic-data-firstName-value')).toContainText(
    YLE_ACCOUNT_NAME
  );
  await expect(
    page.locator('section').filter({ hasText: 'Tunnistautumistapa' })
  ).toContainText('Yle');
});
