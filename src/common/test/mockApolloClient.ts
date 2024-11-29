import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import i18n from '../../i18n/i18nInit';

const cache = new InMemoryCache();

const link = new HttpLink({
  uri: window._env_.REACT_APP_PROFILE_GRAPHQL,
});

const authenticationLink = setContext(async (_, { headers }) => ({
  headers: {
    ...headers,
    authorization: `Bearer mocked-token`,
    'accept-language': i18n.languages[0],
  },
}));

export default new ApolloClient({
  cache,
  link: from([authenticationLink, link]),
});
