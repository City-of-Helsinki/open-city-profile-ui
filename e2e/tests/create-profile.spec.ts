import { test, expect } from '@playwright/test';

import { clickLoginButton, createProfile } from '../utils/utils';
import { Mailbox } from '../utils/mailbox';
import { PROFILE_URL } from '../utils/constants';

test('Profile can be created', async ({ page }) => {
  const mailbox = new Mailbox();
  await mailbox.initializeMailbox();

  await createProfile(page, mailbox);
});

test('Same email address cannot be used for multiple accounts', async ({
  page,
  browser,
}) => {
  const mailbox = new Mailbox();
  await mailbox.initializeMailbox();

  await createProfile(page, mailbox);

  // Start creating a new profile in a new browser context
  const newContext = await browser.newContext();
  const newPage = await newContext.newPage();
  await newPage.goto(PROFILE_URL);
  await clickLoginButton(newPage);
  await newPage.locator('.login-method-helsinki_tunnus a').click();
  await newPage
    .locator('a.hds-button:has-text("Luo Helsinki-profiili")')
    .click();
  await newPage
    .getByPlaceholder('sähköpostiosoite@email.com')
    .fill(mailbox.emailAddress);
  await newPage.getByRole('button', { name: 'Jatka' }).click();

  await mailbox.waitForEmailFromSender();
  const mail = await mailbox.fetchEmailBody();
  expect(mail).toContain(
    'Tämä sähköpostiosoite on jo liitetty olemassa olevaan Helsinki-profiiliin'
  );
});
