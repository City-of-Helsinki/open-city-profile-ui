import React, { useEffect, useContext } from 'react';
import { RouteChildrenProps, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from 'hds-react';

import styles from './PasswordChangeCallback.module.css';
import { getLinkRedirectState } from '../profile/hooks/useHistoryListener';
import { ProfileContext } from '../profile/context/ProfileContext';

function PasswordChangeCallback({
  history,
}: RouteChildrenProps): React.ReactElement | null {
  const { t } = useTranslation();

  const { setPasswordUpdateState } = useContext(ProfileContext);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stat = params.get('kc_action_status');

    if (stat === 'success') {
      setPasswordUpdateState(true);
    }

    history.replace('/', getLinkRedirectState());
  }, [history, location, setPasswordUpdateState]);

  return (
    <div className={styles.wrapper}>
      <LoadingSpinner small />
      <p>{t('loading')}</p>
    </div>
  );
}
export default PasswordChangeCallback;
