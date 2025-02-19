import { test, expect } from '@playwright/test';

import { USER_PASSWORD } from '../utils/constants';
import { loginToProfileWithSuomiFi } from '../utils/utils';

const TEST_SSN = '210281-9988';
const SAVE_SUCCESS = 'Tallennus onnistui';

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  await loginToProfileWithSuomiFi(page, TEST_SSN);
});

test('Modify phonenumber', async ({ page }) => {
  const randomPhoneNumber =
    '040' + Math.floor(Math.random() * 10000000).toString();

  await expect(page.getByTestId('phones-0-value')).toBeVisible();
  await page.getByLabel('Muokkaa puhelinnumeroa').click();
  await page.getByLabel('Kirjoita Puhelinnumero. Tämä').fill(randomPhoneNumber);
  await page.getByTestId('phones-0-save-button').click();
  await expect(page.getByText(SAVE_SUCCESS)).toBeVisible();
  await expect(page.getByTestId('phones-0-value')).toContainText(
    randomPhoneNumber
  );
});

test('Modify address', async ({ page }) => {
  const randomStreetAddress =
    'Testiosoite ' + Math.floor(Math.random() * 1000).toString();
  const randomZipCode = Math.floor(Math.random() * 100000).toString();
  const randomCity =
    'Testikaupunki ' + Math.floor(Math.random() * 1000).toString();

  await page.getByLabel('Muokkaa osoitetta').click();
  await page.getByLabel('Kirjoita Kotiosoite').fill(randomStreetAddress);
  await page.getByLabel('Kirjoita Postinumero').fill(randomZipCode);
  await page.getByLabel('Kirjoita Kaupunki').fill(randomCity);
  await page.getByTestId('addresses-0-save-button').click();
  await expect(page.getByText(SAVE_SUCCESS)).toBeVisible();

  // Check if new values are visible
  await expect(page.getByTestId('addresses-0-address-value')).toContainText(
    randomStreetAddress
  );
  await expect(page.getByTestId('addresses-0-postalCode-value')).toContainText(
    randomZipCode
  );
  await expect(page.getByTestId('addresses-0-city-value')).toContainText(
    randomCity
  );
  await expect(page.getByTestId('addresses-0-countryCode-value')).toContainText(
    'Suomi'
  );
  await expect(page.getByTestId('emails-email')).toContainText('@');
});

test.skip('Change language and verify notification', async ({ page }) => {
  const notificationElement = page
    .locator('#additional-information-edit-notifications')
    .getByLabel('Notification');

  // TODO: Check default language before changing
  await page.getByLabel('Suomi', { exact: true }).click();
  await page.getByRole('option', { name: 'Englanti' }).click();
  await expect(notificationElement).toBeVisible();
  await page.getByLabel('Englanti').click();
  await page.getByRole('option', { name: 'Ruotsi' }).click();
  await expect(notificationElement).toBeVisible();
  await page.getByLabel('Ruotsi').click();
  await page.getByRole('option', { name: 'Suomi' }).click();
  await expect(notificationElement).toBeVisible();
});

test('Change password', async ({ page }) => {
  await expect(page.getByTestId('change-password-button')).toBeVisible();
  await page.getByTestId('change-password-button').click();
  await page.getByLabel('Uusi salasana').click();
  await page.getByLabel('Uusi salasana').fill(USER_PASSWORD);
  await page.getByLabel('Vahvista salasana').click();
  await page.getByLabel('Vahvista salasana').fill(USER_PASSWORD);
  await expect(
    page.getByRole('button', { name: 'Vaihda salasana' })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Vaihda salasana' }).click();
  await expect(page.getByTestId('user-menu-button')).toBeVisible();
  await expect(page.getByText(SAVE_SUCCESS)).toBeVisible();
});

test('Check MFA view', async ({ page }) => {
  await expect(page.getByTestId('enable-totp-button')).toBeVisible();
  await page.getByTestId('enable-totp-button').click();
  await expect(
    page.getByRole('button', { name: 'Ota käyttöön' })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Peruuta' }).click();
  await expect(page.getByTestId('user-menu-button')).toBeVisible();
});
