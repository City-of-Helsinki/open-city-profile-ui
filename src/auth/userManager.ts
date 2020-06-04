import { createUserManager } from 'redux-oidc';
import { UserManagerSettings, WebStorageStateStore } from 'oidc-client';

import store from '../redux/store';
import { fetchApiTokenThunk } from './redux';
import getAuthenticatedUser from './getAuthenticatedUser';

const location = window.location.origin;

/* eslint-disable @typescript-eslint/camelcase */
const settings: UserManagerSettings = {
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  authority: process.env.REACT_APP_OIDC_AUTHORITY,
  automaticSilentRenew: true,
  client_id: process.env.REACT_APP_OIDC_CLIENT_ID,
  redirect_uri: `${location}/callback`,
  response_type: 'id_token token',
  scope: process.env.REACT_APP_OIDC_SCOPE,
  silent_redirect_uri: `${location}/silent_renew.html`,
  post_logout_redirect_uri: `${location}/`,
  // This calculates to 1 minute, good for debugging:
  // https://github.com/City-of-Helsinki/kukkuu-ui/blob/8029ed64c3d0496fa87fa57837c73520e8cbe37f/src/domain/auth/userManager.ts#L18
  // accessTokenExpiringNotificationTime: 59.65 * 60,
};
/* eslint-enable @typescript-eslint/camelcase */

const userManager = createUserManager(settings);

userManager.events.addUserLoaded(async () => {
  const user = await getAuthenticatedUser();
  store.dispatch(fetchApiTokenThunk(user.access_token));
});

export default userManager;
