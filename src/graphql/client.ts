import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
  from,
} from '@apollo/client';
import { getApiTokenFromStorage } from 'hds-react';

import i18n from '../i18n/i18nInit';
import config from '../config';
const cache = new InMemoryCache();
const authMiddleware = new ApolloLink((operation, forward) => {
  const token = getApiTokenFromStorage(config.profileAudience);
  console.log('token', token);
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
