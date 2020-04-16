import userManager from './userManager';
import store from '../redux/store';
import { apiError } from './redux';
import * as Sentry from '@sentry/browser';

export default function(): void {
  userManager.signinRedirect().catch(error => {
    if (error.message !== 'Network Error') {
      Sentry.captureException(error);
    }
    store.dispatch(apiError(error.toString()));
  });
}
