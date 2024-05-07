import { test, expect } from '@playwright/test';

import {
  EXAMPLE_APP_URL,
  PROFILE_API_URL,
  PROFILE_URL,
  TUNNISTAMO_URL,
  TUNNISTUS_URL,
} from '../utils/constants';

test('Example app responds with status 200', async ({ page }) => {
  const res = await page.goto(EXAMPLE_APP_URL);
  expect(res?.status()).toBe(200);
});

test('Profile UI env-config.js is found', async ({ page }) => {
  await page.goto(`${PROFILE_URL}/env-config.js`);
  await expect(page.locator('body')).toContainText('REACT_APP_OIDC_CLIENT_ID');
});

test('Tunnistamo OpenID configuration is found', async ({ page }) => {
  await page.goto(`${TUNNISTAMO_URL}/.well-known/openid-configuration`);
  await expect(page.locator('body')).toContainText('authorization_endpoint');
});

test('Tunnistus OpenID configuration for helsinki-tunnistus realm is found', async ({
  page,
}) => {
  await page.goto(
    `${TUNNISTUS_URL}/auth/realms/helsinki-tunnistus/.well-known/openid-configuration`
  );
  await expect(page.locator('body')).toContainText('authorization_endpoint');
});

test('Profile API GraphQL endpoint responds with status 200', async ({
  page,
}) => {
  const res = await page.goto(`${PROFILE_API_URL}/graphql`);
  expect(res?.status()).toBe(200);
});
