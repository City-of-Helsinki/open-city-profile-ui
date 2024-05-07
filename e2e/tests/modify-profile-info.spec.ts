import { test, expect } from '@playwright/test';

import { loginToProfileWithSuomiFi } from '../utils/utils';

const TEST_SSN = '210281-9988';

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
  await expect(page.getByText('Tallennus onnistui')).toBeVisible();
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
  await expect(page.getByText('Tallennus onnistui')).toBeVisible();

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
  await expect(page.getByTestId('emails-email')).toContainText(
    'miika.korpisalo@hel.fi'
  );
});

test('Change language and verify notification', async ({ page }) => {
  const notificationElement = page
    .locator('#additional-information-edit-notifications')
    .getByLabel('Notification');

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
