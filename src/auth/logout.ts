import * as Sentry from '@sentry/browser';

import authConstants from './constants/authConstants';
import userManager from './userManager';
import store from '../redux/store';
import { apiError } from './redux';

export default function(): void {
  window.localStorage.removeItem(authConstants.OIDC_KEY);
  userManager.signoutRedirect().catch(error => {
    Sentry.captureException(error);
    store.dispatch(apiError(error.toString()));
  });
}
