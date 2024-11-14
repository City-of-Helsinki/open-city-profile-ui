import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getApiTokensFromStorage } from 'hds-react';

import i18n from '../i18n/i18nInit';
import pickProfileApiToken from '../auth/pickProfileApiToken';

function delay(time: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, time));
}

// After login and in some other cases, the API tokens are not immediately available.
async function waitForApiToken(
  maxRetries = 10,
  interval = 200
): Promise<string> {
  let retries = 0;

  while (retries < maxRetries) {
    const apiTokens = getApiTokensFromStorage();

    if (apiTokens !== null) {
      return pickProfileApiToken(apiTokens); // Return the token when available
    }

    retries += 1;
    await delay(interval);
  }

  throw new Error('Failed to retrieve API tokens after max retries');
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
