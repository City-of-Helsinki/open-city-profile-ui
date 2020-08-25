import React from 'react';
import * as Sentry from '@sentry/browser';

import useToast from '../toast/useToast';
import userManager from './userManager';
import authConstants from './constants/authConstants';

function useAuthenticate() {
  const { createToast } = useToast();

  const authenticate = React.useCallback(() => {
    userManager.signinRedirect().catch(error => {
      if (error.message !== 'Network Error') {
        Sentry.captureException(error);
      }

      createToast({ type: 'error' });
    });
  }, [createToast]);

  const logout = React.useCallback(() => {
    window.localStorage.removeItem(authConstants.OIDC_KEY);
    userManager.signoutRedirect().catch(error => {
      Sentry.captureException(error);
      createToast({ type: 'error' });
    });
  }, [createToast]);

  return [authenticate, logout];
}

export default useAuthenticate;
