import React from 'react';

import styles from './gdprAuthorizationCodeManagerCallback.module.css';
import { useDownloadProfileQueueD } from './useDownloadProfileQueue';

function GdprAuthorizationCodeManagerCallback(): React.ReactElement {
  const { start } = useDownloadProfileQueueD({ doNotClearOnUnmount: true });
  React.useEffect(() => {
    start('consumeCode');
  }, [start]);

  return (
    <div className={styles['wrapper']}>
      <div className={styles['fake-navigation']} />
      <div className={styles['fake-page-heading']} />
      <div className={styles['fake-content']} />
    </div>
  );
}

export default GdprAuthorizationCodeManagerCallback;
