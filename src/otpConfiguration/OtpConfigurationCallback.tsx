import React, { useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from 'hds-react';

import styles from './OtpConfigurationCallback.module.css';
import { getLinkRedirectState } from '../profile/hooks/usePageLoadFocusSetter';
import { ProfileContext } from '../profile/context/ProfileContext';

export interface OtpConfigurationCallbackProps {
  action?: 'delete';
}

function OtpConfigurationCallback({ action }: OtpConfigurationCallbackProps): React.ReactElement | null {
  const { t } = useTranslation();
  const { setOtpConfigurationState, setOtpDeleteState } = useContext(ProfileContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stat = params.get('kc_action_status');

    if (stat === 'success') {
      if (action === 'delete') {
        setOtpDeleteState(true);
      } else {
        setOtpConfigurationState(true);
      }
    }

    navigate('/', { state: getLinkRedirectState() });
  }, [action, location, setOtpConfigurationState, setOtpDeleteState, navigate]);

  return (
    <div className={styles.wrapper}>
      <LoadingSpinner small />
      <p>{t('loading')}</p>
    </div>
  );
}

export default OtpConfigurationCallback;
