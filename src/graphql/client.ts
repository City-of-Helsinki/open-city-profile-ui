import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
  from,
} from '@apollo/client';

import i18n from '../i18n/i18nInit';
import authService from '../auth/authService';
const cache = new InMemoryCache();
const authMiddleware = new ApolloLink((operation, forward) => {
  const token = authService.getToken();

  if (token) {
    operation.setContext({
      headers: {
        authorization: `Bearer ${token}`,
        'Accept-Language': i18n.languages[0],
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
