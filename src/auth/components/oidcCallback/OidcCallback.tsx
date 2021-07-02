import React, { useCallback, useEffect } from 'react';
import { RouteChildrenProps } from 'react-router';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/browser';

import authService from '../../authService';

function OidcCallback({
  history,
}: RouteChildrenProps): React.ReactElement | null {
  const { t } = useTranslation();

  const redirectToErrorPage = useCallback(
    (message: string) => {
      history.replace(`/error?message=${encodeURIComponent(message)}`);
    },
    [history]
  );

  useEffect(() => {
    authService
      .endLogin()
      .then(() => {
        history.replace('/');
      })
      .catch((error: Error) => {
        // Handle error caused by device time being more than 5 minutes off
        if (
          error.message.includes('iat is in the future') ||
          error.message.includes('exp is in the past')
        ) {
          redirectToErrorPage(t('authentication.deviceTimeError.message'));
        } else if (
          // Handle error caused by end user choosing Deny in Tunnistamo's
          // permission request
          error.message ===
          'The resource owner or authorization server denied the request'
        ) {
          redirectToErrorPage(
            t('authentication.permissionRequestDenied.message')
          );
        } else {
          // Send other errors to Sentry for analysis
          Sentry.captureException(error);
          // Give user a generic error
          redirectToErrorPage(t('authentication.genericError.message'));
        }
      });
  }, [history, redirectToErrorPage, t]);

  return t('oidc.authenticating');
}

export default OidcCallback;
