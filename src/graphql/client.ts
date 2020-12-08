import ApolloClient from 'apollo-boost';

import i18n from '../i18n/i18nInit';
import authService from '../auth/authService';

export default new ApolloClient({
  request: async operation => {
    const token = authService.getToken();

    if (token) {
      operation.setContext({
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept-Language': i18n.languages[0],
        },
      });
    }
  },
  uri: process.env.REACT_APP_PROFILE_GRAPHQL,
});
