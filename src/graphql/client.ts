import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
  from,
} from '@apollo/client';
import { getApiTokensFromStorage } from 'hds-react';

import i18n from '../i18n/i18nInit';
import pickProfileApiToken from '../auth/pickProfileApiToken';

const cache = new InMemoryCache();
const authMiddleware = new ApolloLink((operation, forward) => {
  let token = null;
  const apiTokens = getApiTokensFromStorage();
  if (apiTokens) {
    token = pickProfileApiToken(apiTokens);
  }

  if (token) {
    operation.setContext({
      headers: {
        authorization: `Bearer ${token}`,
        'accept-language': i18n.languages[0],
      },
    });
  }

  return forward(operation);
});

const link = new HttpLink({
  uri: window._env_.REACT_APP_PROFILE_GRAPHQL,
});

export default new ApolloClient({
  cache,
  link: from([authMiddleware, link]),
});
