import React from 'react';

import styles from './gdprAuthorizationCodeManagerCallback.module.css';
import useAuthCodeQueues, {
  authCodeQueuesStorageKey,
} from './useAuthCodeQueues';
import { getStoredQueueData } from '../common/actionQueue/actionQueueStorage';
import { QueueProps } from './actions/queues';

function GdprAuthorizationCodeManagerCallback(): React.ReactElement {
  const storedData = getStoredQueueData(authCodeQueuesStorageKey) as QueueProps;
  const downloadProfileQueue = useAuthCodeQueues(storedData);
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
