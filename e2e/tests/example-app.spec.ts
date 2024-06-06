import { test, expect } from '@playwright/test';

import {
  clickServiceConnectionsLink,
  loginToExampleApp,
  loginToProfileWithSuomiFi,
} from '../utils/utils';

const TEST_SSN = '241298-999N';

test.describe.configure({ mode: 'serial' });

test.describe('Example app tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginToExampleApp(page, TEST_SSN);
  });

  test('Profile email is verified', async ({ page }) => {
    await page.locator('[data-test-id="header-link-profile"]').click();
    await expect(
      page.locator('[data-test-id="profile-data-primaryEmail"]')
    ).toContainText('verified": true');
  });

  test('Verify JWT expiration time and AMR', async ({ page }) => {
    const validAmrValue = 'suomi_fi';
    const validTimeValue = 300;

    await page.locator('[data-test-id="header-link-userTokens"]').click();
    await page.getByText('Käyttäjän accessToken').click();

    const decodedTokenPayloadLocator = page.locator(
      '[data-test-id="decoded-token-payload"]'
    );
    await expect(decodedTokenPayloadLocator).toContainText('exampleapp-ui-dev');

    const jwtTokenSelector = await decodedTokenPayloadLocator.innerText();
    const { amr, iat, exp } = JSON.parse(jwtTokenSelector);
    const jwtValidTime = Number(exp) - Number(iat);

    expect(amr.toString()).toBe(validAmrValue);
    expect(jwtValidTime).toBe(validTimeValue);
  });

  test('Change pet name', async ({ page }) => {
    await page.locator('[data-test-id="header-link-backend"]').click();
    await page.getByLabel('Uusi lemmikin nimi').fill('nodelete');
    await page.getByRole('button', { name: 'Tallenna' }).click();
    await expect(page.locator('form')).toContainText(
      'Tallennettu lemmikin nimi: nodelete'
    );
  });
});

test.describe('Profile tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginToProfileWithSuomiFi(page, TEST_SSN);
  });

  test('Delete profile forbidden', async ({ page }) => {
    await page.getByRole('button', { name: 'Poista omat tiedot' }).click();
    await page.getByTestId('confirmation-modal-confirm-button').click();
    await expect(
      page.locator('#delete-profile-error-modal-title')
    ).toBeVisible();
  });

  test('Service connection delete forbidden', async ({ page }) => {
    await clickServiceConnectionsLink(page);
    await page.getByTestId('example-application-toggle-button').click();
    await page
      .getByTestId('delete-service-connection-example-application-button')
      .click();
    await page.getByTestId('confirmation-modal-confirm-button').click();
    await expect(
      page.getByTestId('service-connection-delete-forbidden-text')
    ).toBeVisible();
  });
});
