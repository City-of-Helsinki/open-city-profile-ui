import React, { useEffect } from 'react';
import { RouteChildrenProps } from 'react-router';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/react';
import { LoadingSpinner } from 'hds-react';
/* 
import authService from '../../authService';
import { useErrorPageRedirect } from '../../../profile/hooks/useErrorPageRedirect';
import styles from './OidcCallback.module.css';
import { getLinkRedirectState } from '../../../profile/hooks/useHistoryListener';

function OidcCallback({
  history,
}: RouteChildrenProps): React.ReactElement | null {
  const { t } = useTranslation();
  const redirectToErrorPage = useErrorPageRedirect();

  useEffect(() => {
    authService
      .endLogin()
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
            message: t('authentication.genericError.message'),
          });
        }
      });
  }, [history, redirectToErrorPage, t]);

  return (
    <div className={styles.wrapper}>
      <LoadingSpinner small />
      <p>{t('oidc.authenticating')}</p>
    </div>
  );
}

export default OidcCallback;

*/
