import React, { useEffect, useContext } from 'react';
import { RouteChildrenProps } from 'react-router';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from 'hds-react';

import { useErrorPageRedirect } from '../profile/hooks/useErrorPageRedirect';
import styles from '../auth/components/oidcCallback/OidcCallback.module.css';
import { getLinkRedirectState } from '../profile/hooks/useHistoryListener';
import { ProfileContext } from '../profile/context/ProfileContext';

function PasswordChangeCallback({
  history,
}: RouteChildrenProps): React.ReactElement | null {
  const { t } = useTranslation();
  const redirectToErrorPage = useErrorPageRedirect();

  const { setPasswordUpdateState } = useContext(ProfileContext);

  useEffect(() => {
    const params = new URLSearchParams(document.location.search);
    const stat = params.get('kc_action_status');

    if (stat === 'success') {
      setPasswordUpdateState(true);
    }

    history.replace('/', getLinkRedirectState());
  }, [history, redirectToErrorPage, setPasswordUpdateState, t]);

  return (
    <div className={styles.wrapper}>
      <LoadingSpinner small />
      <p>{t('loading')}</p>
    </div>
  );
}
export default PasswordChangeCallback;
