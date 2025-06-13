import fs from 'fs';

import { Page, expect } from '@playwright/test';

import { Mailbox } from './mailbox';
import {
  PROFILE_URL,
  USER_PASSWORD,
  EXAMPLE_APP_URL,
  USER_FIRSTNAME,
  USER_LASTNAME,
  PROFILE_NAME,
} from './constants';

const LOG_IN_BUTTON = 'Kirjaudu sisään';

export const fillSSNAndContinue = async (page: Page, SSN: string) => {
  await page.getByPlaceholder('-9988').fill(SSN);
  await page.locator('.box').click();
  await page.getByRole('button', { name: 'Tunnistaudu' }).click();
};

// Click login button in profile app page
export const clickProfileLoginButton = async (page: Page) => {
  await page.getByLabel(LOG_IN_BUTTON, { exact: true }).click();
};

// Click login button in keycloak
export const clickKeycloakLoginButton = async (page: Page) => {
  await page.getByRole('button', { name: LOG_IN_BUTTON }).click();
};

export const clickServiceConnectionsLink = async (page: Page) => {
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Käyttämäsi palvelut' })
    .click();
};

export const loginToProfileWithEmail = async (page: Page, email: string) => {
  await page.goto(PROFILE_URL);
  await clickProfileLoginButton(page);
  await page.getByLabel('Sähköposti').fill(email);
  await page.getByLabel('Salasana', { exact: true }).fill(USER_PASSWORD);
  await clickKeycloakLoginButton(page);
  await expect(page.getByLabel(PROFILE_NAME)).toBeVisible();
  await expect(
    page.getByTestId('profile-information-explanation')
  ).toBeVisible();
};

export const loginToProfileWithSuomiFi = async (page: Page, ssn: string) => {
  await page.goto(PROFILE_URL);
  await clickProfileLoginButton(page);
  await page.getByRole('link', { name: 'Suomi.fi-tunnistautuminen' }).click();
  await page.getByRole('link', { name: 'Testitunnistaja' }).click();
  await fillSSNAndContinue(page, ssn);
  await Promise.all([
    page.waitForURL(PROFILE_URL),
    page.getByRole('button', { name: 'Jatka palveluun' }).click(),
  ]);
  await expect(
    page.getByTestId('profile-information-explanation')
  ).toBeVisible();
};

export const loginToExampleApp = async (page: Page, ssn: string) => {
  await page.goto(EXAMPLE_APP_URL);
  await page
    .getByRole('banner')
    .getByRole('button', { name: LOG_IN_BUTTON })
    .click();
  await page.getByRole('link', { name: 'Suomi.fi identification' }).click();
  await page.getByRole('link', { name: 'Test IdP' }).click();
  await fillSSNAndContinue(page, ssn);
  await page.getByRole('button', { name: 'Continue to service' }).click();
  await expect(
    page.getByRole('heading', { name: 'Client-demo' })
  ).toBeVisible();
};

export const checkDownloadedJson = async (page: Page, values: string[]) => {
  const userData = [USER_FIRSTNAME, USER_LASTNAME];

  const downloadPromise = page.waitForEvent('download');
  await page.locator('#download-profile-button').click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  const data = fs.readFileSync(downloadPath);
  const json = JSON.parse(data.toString());
  const jsonAsString = JSON.stringify(json);

  const valuesToCheck = [...userData, ...values];
  valuesToCheck.forEach(value => expect.soft(jsonAsString).toContain(value));
};

export const createProfile = async (page: Page, mailbox: Mailbox) => {
  await page.goto(PROFILE_URL);
  await clickProfileLoginButton(page);
  await page.locator('a.hds-button:has-text("Luo Helsinki-profiili")').click();
  await page
    .getByPlaceholder('sähköpostiosoite@email.com')
    .fill(mailbox.emailAddress);
  await page.getByRole('button', { name: 'Jatka' }).click();
  await page.waitForTimeout(5000);
  await mailbox.waitForEmailFromSender();

  const validationCode = await mailbox.getValidationCode();
  expect(validationCode).toHaveLength(6);

  // Fill in the validation code
  await page.locator('#hs-verification-code').fill(validationCode);
  await page.getByRole('button', { name: 'Jatka' }).click();

  // Fill in the form
  await page.locator('#firstName').fill(USER_FIRSTNAME);
  await page.locator('#lastName').fill(USER_LASTNAME);
  await page.locator('#password').fill(USER_PASSWORD);
  await page.locator('#password-confirm').fill(USER_PASSWORD);
  await page.locator('#hs-register-acknowledgements').click();
  await page.locator('#hs-register-age-check').click();
  await page.locator('input[value="Luo profiili"]').click();
  await expect(page.getByLabel(PROFILE_NAME)).toBeVisible();
};

// Accept cookies. Makes it easier to focus on the actual test cases
export const acceptCookies = async (page: Page) => {
  await page.goto(PROFILE_URL);
  const title = page.getByRole('heading', {
    name: 'Profiili käyttää evästeitä',
  });
  await expect(title).toBeVisible();
  await page.getByRole('button', { name: 'Hyväksy kaikki evästeet' }).click();
  await expect(title).toBeHidden();
};
