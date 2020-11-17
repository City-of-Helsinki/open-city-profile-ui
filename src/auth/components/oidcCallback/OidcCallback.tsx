import React, { useState, useEffect } from 'react';
import { RouteChildrenProps } from 'react-router';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/browser';

import authService from '../../authService';

type AuthenticationError =
  | 'deviceTimeError'
  | 'permissionDeniedByUserError'
  | 'unknown';

function OidcCallback({ history }: RouteChildrenProps) {
  const { t } = useTranslation();
  const [
    authenticationError,
    setAuthenticationError,
  ] = useState<AuthenticationError | null>(null);

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
          setAuthenticationError('deviceTimeError');
        } else if (
          // Handle error caused by end user choosing Deny in Tunnistamo's
          // permission request
          error.message ===
          'The resource owner or authorization server denied the request'
        ) {
          setAuthenticationError('permissionDeniedByUserError');
        } else {
          // Send other errors to Sentry for analysis
          Sentry.captureException(error);
          // Give user a generic error
          setAuthenticationError('unknown');
        }
      });
  }, [history, t]);

  const isDeviceTimeError = authenticationError === 'deviceTimeError';
  const isPermissionDeniedByUserError =
    authenticationError === 'permissionDeniedByUserError';
  const isUnknownError = authenticationError === 'unknown';

  return (
    <>
      {isDeviceTimeError && (
        <p>{t('authentication.deviceTimeError.message')}</p>
      )}
      {isPermissionDeniedByUserError && (
        <p>{t('authentication.permissionRequestDenied.message')}</p>
      )}
      {isUnknownError && <p>{t('authentication.genericError.message')}</p>}
    </>
  );
}

export default OidcCallback;
