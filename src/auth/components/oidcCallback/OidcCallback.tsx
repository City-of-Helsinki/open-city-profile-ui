import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LoadingSpinner,
  LoginCallbackHandler,
  OidcClientError,
} from 'hds-react';
import * as Sentry from '@sentry/react';

import { useErrorPageRedirect } from '../../../profile/hooks/useErrorPageRedirect';
import styles from './OidcCallback.module.css';
import { getLinkRedirectState } from '../../../profile/hooks/usePageLoadFocusSetter';

export function sonarBranchTest(x: number) {
  if (x > 10) return 'big';
  return 'small';
}

export function sonarBranchTestTwo(x: number) {
  if (x > 10) return 'big';
  return 'small';
}

function OidcCallback(): React.ReactElement | null {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const redirectToErrorPage = useErrorPageRedirect();
  const genericErrorString = 'authentication.genericError.message';

  const onSuccess = () => {
    // Successful login - redirect to profile page
    navigate('/', { state: getLinkRedirectState() });
  };

  const onError = (error?: OidcClientError) => {
    if (!error) {
      redirectToErrorPage({
        message: t(genericErrorString),
      });
      return;
    }

    // Send errors to Sentry for analysis
    Sentry.captureException(error);
    // Give user a generic error
    redirectToErrorPage({
      message: t(genericErrorString),
    });
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

export default OidcCallback;
