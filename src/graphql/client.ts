import ApolloClient from 'apollo-boost';

import store from '../redux/store';
import { profileApiTokenSelector } from '../auth/redux';
import getAuthenticatedUser from '../auth/getAuthenticatedUser';
import fetchApiToken from '../auth/fetchApiToken';
import pickProfileApiToken from '../auth/pickProfileApiToken';
import i18n from '../i18n/i18nInit';

const getToken = async () => {
  try {
    // First try to get previously fetched token from store
    const tokenFromStore = profileApiTokenSelector(store.getState());
    if (tokenFromStore) {
      return tokenFromStore;
    }
    // If not found from store, fallback to fetching api-token from api.
    const tunnistamoUser = await getAuthenticatedUser();
    const tokens = await fetchApiToken(tunnistamoUser.access_token);
    return pickProfileApiToken(tokens);
  } catch (e) {
    return null;
  }
};

export default new ApolloClient({
  request: async operation => {
    const token = await getToken();
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
