import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './gdprAuthorizationCodeManagerCallback.module.css';
import useAuthCodeQueues, {
  AuthCodeQueuesProps,
  authCodeQueuesStorageKey,
} from './useAuthCodeQueues';
import { getStoredQueueData } from '../common/actionQueue/actionQueueStorage';
import { useErrorPageRedirect } from '../profile/hooks/useErrorPageRedirect';

function GdprAuthorizationCodeManagerCallback(): React.ReactElement {
  const redirectToErrorPage = useErrorPageRedirect();
  const { t } = useTranslation();
  const storedData = getStoredQueueData(authCodeQueuesStorageKey) || {};

  const onError = useCallback(() => {
    redirectToErrorPage({
      message: t('notification.defaultErrorText'),
    });
  }, [redirectToErrorPage, t]);
  const authCodeQueueProps = ({
    ...storedData,
    onError,
  } as unknown) as AuthCodeQueuesProps;
  const downloadProfileQueue = useAuthCodeQueues(authCodeQueueProps);
  React.useEffect(() => {
    if (downloadProfileQueue.shouldHandleCallback()) {
      downloadProfileQueue.resume();
    }
  });

  return (
    <div className={styles['wrapper']}>
      <div className={styles['fake-navigation']} />
      <div className={styles['fake-page-heading']} />
      <div className={styles['fake-content']} />
    </div>
  );
}

export default GdprAuthorizationCodeManagerCallback;
