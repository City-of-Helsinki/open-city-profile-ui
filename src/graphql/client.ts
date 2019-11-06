import ApolloClient from 'apollo-boost';

import store from '../redux/store';
import { profileApiTokenSelector } from '../auth/redux';

export default new ApolloClient({
  request: async operation => {
    const apiTokenInStore = profileApiTokenSelector(store.getState());
    if (apiTokenInStore) {
      operation.setContext({
        headers: {
          Authorization: `Bearer ${apiTokenInStore}`,
        },
      });
    }
  },
  uri: process.env.REACT_APP_PROFILE_GRAPHQL,
});
