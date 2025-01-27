import React, { useEffect, useContext } from 'react';
import { RouteChildrenProps, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from 'hds-react';

import styles from './OtpConfigurationCallback.module.css';
import { getLinkRedirectState } from '../profile/hooks/useHistoryListener';
import { ProfileContext } from '../profile/context/ProfileContext';

export interface OtpConfigurationCallbackProps extends RouteChildrenProps {
  action: string | null;
}

function OtpConfigurationCallback({
  history,
  action,
}: OtpConfigurationCallbackProps): React.ReactElement | null {
  const { t } = useTranslation();

  const { setOtpConfigurationState, setOtpDeleteState } = useContext(
    ProfileContext
  );
  const location = useLocation();

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

    history.replace('/', getLinkRedirectState());
  }, [action, history, location, setOtpConfigurationState, setOtpDeleteState]);

  return (
    <div className={styles.wrapper}>
      <LoadingSpinner small />
      <p>{t('loading')}</p>
    </div>
  );
}
export default OtpConfigurationCallback;
