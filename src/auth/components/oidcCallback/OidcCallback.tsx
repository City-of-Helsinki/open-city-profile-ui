import React, { useState } from 'react';
import { CallbackComponent } from 'redux-oidc';
import { RouteChildrenProps } from 'react-router';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/browser';

import userManager from '../../userManager';

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

  const onSuccess = () => {
    // Use replace in order to hide the callback view from history.
    history.replace('/');
  };

  const onError = (error: Error) => {
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
  };

  const isDeviceTimeError = authenticationError === 'deviceTimeError';
  const isPermissionDeniedByUserError =
    authenticationError === 'permissionDeniedByUserError';
  const isUnknownError = authenticationError === 'unknown';

  return (
    <CallbackComponent
      successCallback={onSuccess}
      errorCallback={onError}
      userManager={userManager}
    >
      <>
        {isDeviceTimeError && (
          <p>{t('authentication.deviceTimeError.message')}</p>
        )}
        {isPermissionDeniedByUserError && (
          <p>{t('authentication.permissionRequestDenied.message')}</p>
        )}
        {isUnknownError && <p>{t('authentication.genericError.message')}</p>}
      </>
    </CallbackComponent>
  );
}

export default OidcCallback;
