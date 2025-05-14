import React, { useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from 'hds-react';

import styles from './PasswordChangeCallback.module.css';
import { getLinkRedirectState } from '../profile/hooks/usePageLoadFocusSetter';
import { ProfileContext } from '../profile/context/ProfileContext';

function PasswordChangeCallback(): React.ReactElement | null {
  const { t } = useTranslation();
  const { setPasswordUpdateState } = useContext(ProfileContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stat = params.get('kc_action_status');

    if (stat === 'success') {
      setPasswordUpdateState(true);
    }

    navigate('/', { state: getLinkRedirectState() });
  }, [location, setPasswordUpdateState, navigate]);

  return (
    <div className={styles.wrapper}>
      <LoadingSpinner small />
      <p>{t('loading')}</p>
    </div>
  );
}

export default PasswordChangeCallback;
