import React from 'react';
import { RouteChildrenProps } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  LoadingSpinner,
  LoginCallbackHandler,
  OidcClientError,
  User,
} from 'hds-react';
import * as Sentry from '@sentry/react';

import useAuth from '../../useAuth';
import { useErrorPageRedirect } from '../../../profile/hooks/useErrorPageRedirect';
import styles from './OidcCallback.module.css';
import { getLinkRedirectState } from '../../../profile/hooks/useHistoryListener';

function LoginCallback({
  history,
}: RouteChildrenProps): React.ReactElement | null {
  const { t } = useTranslation();
  const redirectToErrorPage = useErrorPageRedirect();
  const { endLogin } = useAuth();
  const generigErrorString = 'authentication.genericError.message';

  const onSuccess = (user: User) => {
    // Handle successful login - redirect to profile page
    endLogin(user)
      .then(() => {
        history.replace('/', getLinkRedirectState());
      })
      .catch((error: Error) => {
        // Handle error caused by device time being more than 5 minutes off
        if (
          error.message.includes('iat is in the future') ||
          error.message.includes('exp is in the past')
        ) {
          redirectToErrorPage({
            message: t('authentication.deviceTimeError.message'),
          });
        } else if (
          // Handle error caused by end user choosing Deny in Tunnistamo's
          // permission request
          error.message ===
          'The resource owner or authorization server denied the request'
        ) {
          redirectToErrorPage({
            message: t('authentication.permissionRequestDenied.message'),
          });
        } else {
          // Send other errors to Sentry for analysis
          Sentry.captureException(error);
          // Give user a generic error
          redirectToErrorPage({
            message: t(generigErrorString),
          });
        }
      });
  };

  const onError = (error?: OidcClientError) => {
    //Handle error
    if (!error) {
      redirectToErrorPage({
        message: t('authentication.genericError.message'),
      });
      return;
    }

    // Handle error caused by device time being more than 5 minutes off
    if (
      error.message.includes('iat is in the future') ||
      error.message.includes('exp is in the past')
    ) {
      redirectToErrorPage({
        message: t('authentication.deviceTimeError.message'),
      });
    } else if (
      // Handle error caused by end user choosing Deny in Tunnistamo's
      // permission request
      error.message ===
      'The resource owner or authorization server denied the request'
    ) {
      redirectToErrorPage({
        message: t('authentication.permissionRequestDenied.message'),
      });
    } else {
      // Send other errors to Sentry for analysis
      Sentry.captureException(error);
      // Give user a generic error
      redirectToErrorPage({
        message: t(generigErrorString),
      });
    }
  };

  return (
    <LoginCallbackHandler onSuccess={onSuccess} onError={onError}>
      <div className={styles.wrapper}>
        <LoadingSpinner small />
        <p>{t('oidc.authenticating')}</p>
      </div>
    </LoginCallbackHandler>
  );
}

export default LoginCallback;
