import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getApiTokensFromStorage } from 'hds-react';

import i18n from '../i18n/i18nInit';
import pickProfileApiToken from '../auth/pickProfileApiToken';

function delay(time: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// After login and in some other cases, the API tokens are not immediately available.
// Default to 50 retries with 300ms interval = 15 seconds total timeout
// (Previous values: 10 retries × 200ms = 2 seconds, which was too short and caused intermittent failures)
async function waitForApiToken(
  maxRetries = Number(window._env_.REACT_APP_API_TOKEN_MAX_RETRIES) || 50,
  interval = Number(window._env_.REACT_APP_API_TOKEN_RETRY_INTERVAL) || 300
): Promise<string> {
  let retries = 0;
  const startTime = Date.now();

  while (retries < maxRetries) {
    const apiTokens = getApiTokensFromStorage();

    if (apiTokens !== null) {
      const elapsedTime = Date.now() - startTime;
      if (retries > 0) {
        console.log(
          `API tokens retrieved successfully after ${retries} retries (${elapsedTime}ms)`
        );
      }
      return pickProfileApiToken(apiTokens); // Return the token when available
    }

    retries += 1;
    await delay(interval);
  }

  const totalWaitTime = Date.now() - startTime;
  const errorMessage = `Failed to retrieve API tokens after ${maxRetries} retries (${totalWaitTime}ms total wait time)`;
  console.error(errorMessage);
  throw new Error(errorMessage);
}

const cache = new InMemoryCache();

const link = new HttpLink({
  uri: window._env_.REACT_APP_PROFILE_GRAPHQL,
});

const authenticationLink = setContext(async (_, { headers }) => {
  const token = await waitForApiToken();

  return {
    headers: {
      ...headers,
      authorization: `Bearer ${token}`,
      'accept-language': i18n.languages[0],
    },
  };
});

export default new ApolloClient({
  cache,
  link: from([authenticationLink, link]),
});
