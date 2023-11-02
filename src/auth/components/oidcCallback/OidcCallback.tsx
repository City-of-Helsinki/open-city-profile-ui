import React, { useState } from 'react';
import { RouteChildrenProps } from 'react-router';
import * as Sentry from '@sentry/browser';
import { LoginCallbackHandler, OidcClientError } from 'hds-react';

/*
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
      <LoginCallbackHandler onSuccess={onSuccess} onError={onError}>
      <LoadingSpinner small />
      <p>{t('oidc.authenticating')}</p>
      </LoginCallbackHandler>
    </div>
  );
}
*/

function OidcCallback({
  history,
}: RouteChildrenProps): React.ReactElement | null {
  const [userOrError, setUserOrError] = useState<
    Sentry.User | OidcClientError | undefined
  >(undefined);
  const onSuccess = (user: Sentry.User) => {
    history.push('/');
  };
  const onError = (error?: OidcClientError) => {
    setUserOrError(error);
  };

  if (userOrError instanceof Error) {
    return (
      <div>
        <p>Login failed!</p>
      </div>
    );
  }
  if (userOrError) {
    return <div>Redirecting...</div>;
  }

  return (
    <LoginCallbackHandler onSuccess={onSuccess} onError={onError}>
      <div>Logging in...</div>
    </LoginCallbackHandler>
  );
}

export default OidcCallback;
