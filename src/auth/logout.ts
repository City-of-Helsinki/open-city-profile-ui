import * as Sentry from '@sentry/browser';

import userManager from './userManager';
import store from '../redux/store';
import { apiError } from './redux';

export default function(): void {
  userManager.signoutRedirect().catch(error => {
    Sentry.captureException(error);
    store.dispatch(apiError(error.toString()));
  });
}
