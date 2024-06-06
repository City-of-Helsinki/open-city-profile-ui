import { test, expect } from '@playwright/test';

import { Mailbox } from '../utils/mailbox';
import {
  createProfile,
  loginToProfileWithEmail,
  checkDownloadedJson,
  clickLoginButton,
  clickServiceConnectionsLink,
} from '../utils/utils';
import {
  LINKED_EVENTS_URL,
  USER_PASSWORD,
  PROFILE_URL,
} from '../utils/constants';

test.describe.configure({ mode: 'serial' });

const mailbox = new Mailbox();

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  await mailbox.initializeMailbox();
  await createProfile(page, mailbox);
});

test('1 - No connected accounts', async ({ page }) => {
  await loginToProfileWithEmail(page, mailbox.emailAddress);
  const valuesThatShouldBeInJson = ['profile-ui', mailbox.emailAddress];
  await checkDownloadedJson(page, valuesThatShouldBeInJson);
  await clickServiceConnectionsLink(page);
  await expect(
    page.getByText(
      'Sinulla ei tällä hetkellä ole palveluita liitettynä profiiliisi'
    )
  ).toBeVisible({ timeout: 15000 });
});

test.skip('2 - Connect profile to Linked Events', async ({ page }) => {
  await page.goto(LINKED_EVENTS_URL);
  await clickLoginButton(page);
  await page.getByLabel('Sähköposti').fill(mailbox.emailAddress);
  await page.getByLabel('Salasana').fill(USER_PASSWORD);
  await clickLoginButton(page);
  await expect(
    page.getByText(
      'Palvelu Linked Events DEV pyytää lupaa käyttää seuraavia tietoja profiilistasi'
    )
  ).toBeVisible({ timeout: 15000 });
  await page.locator('#hs-acknowledgements').check();
  await page.locator('#hs-age-check').check();
  await page.getByRole('button', { name: 'Jatka' }).click();
  await expect(
    page.getByText('Helsingin tapahtumat ja harrastukset')
  ).toBeVisible();

  // Check that the connected profile is visible
  await page.goto(PROFILE_URL);
  await clickLoginButton(page);
  await page.getByRole('link', { name: 'Helsinki-tunnus' }).click();
  const valuesThatShouldBeInJson = ['linkedevents-test', mailbox.emailAddress];
  await checkDownloadedJson(page, valuesThatShouldBeInJson);
  await clickServiceConnectionsLink(page);
  await expect(page.getByText('Linked Events Dev')).toBeVisible();

  // Remove the connection
  await clickServiceConnectionsLink(page);
  await page.getByTestId('linkedevents-test-toggle-button').click();
  await expect(
    page.getByTestId('service-connection-linkedevents-test-information')
  ).toBeVisible();
  await page
    .getByTestId('delete-service-connection-linkedevents-test-button')
    .click();
  await expect(
    page.getByTestId('service-connection-delete-verification-text')
  ).toBeVisible();
  await page.getByTestId('confirmation-modal-confirm-button').click();
  await expect(
    page.getByTestId('service-connection-delete-failed-text')
  ).not.toBeVisible();
  await expect(
    page.getByTestId('service-connection-delete-successful-text')
  ).toBeVisible();
});

test('3 - Delete profile', async ({ page }) => {
  await loginToProfileWithEmail(page, mailbox.emailAddress);
  await page.locator('#delete-profile-button').click();
  await expect(
    page.getByText('Haluatko varmasti poistaa kaikki tietosi')
  ).toBeVisible();
  await page.getByTestId('confirmation-modal-confirm-button').click();
  await expect(
    page.getByText(
      'Helsinki-profiili ja kaikki sinusta tallentamamme tiedot on poistettu onnistuneesti'
    )
  ).toBeVisible();

  // Try to login after deleting the profile
  await page.goto(PROFILE_URL + '/login');
  await clickLoginButton(page);
  await page.getByLabel('Sähköposti').fill(mailbox.emailAddress);
  await page.getByLabel('Salasana').fill(USER_PASSWORD);
  await clickLoginButton(page);
  await expect(page.getByText('Väärä sähköposti tai salasana')).toBeVisible();
});
