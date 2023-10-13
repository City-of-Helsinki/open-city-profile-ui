import React from 'react';

import styles from './gdprAuthorizationCodeManagerCallback.module.css';
import useAuthCodeQueues from './useAuthCodeQueues';

function GdprAuthorizationCodeManagerCallback(): React.ReactElement {
  const downloadProfileQueue = useAuthCodeQueues();
  React.useEffect(() => {
    if (downloadProfileQueue.shouldHandleCallback()) {
      downloadProfileQueue.resume();
    }
  }, [downloadProfileQueue]);

  return (
    <div className={styles['wrapper']}>
      <div className={styles['fake-navigation']} />
      <div className={styles['fake-page-heading']} />
      <div className={styles['fake-content']} />
    </div>
  );
}

export default GdprAuthorizationCodeManagerCallback;
