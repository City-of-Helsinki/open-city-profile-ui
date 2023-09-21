import React from 'react';

import styles from './gdprAuthorizationCodeManagerCallback.module.css';
import { useDownloadProfileQueueD } from './useDownloadProfileQueue';
import { shouldKeycloakHandlerExecute } from './queueActions/keycloakAuthorizationCodeHandlerAction';
import { shouldTunnistamoHandlerExecute } from './queueActions/tunnistamoAuthorizationCodeRedirectionAction.';

function GdprAuthorizationCodeManagerCallback(): React.ReactElement {
  const { start, getFirstIdle } = useDownloadProfileQueueD({
    doNotClearOnUnmount: true,
  });
  React.useEffect(() => {
    const next = getFirstIdle();
    if (
      !shouldTunnistamoHandlerExecute(next) &&
      !shouldKeycloakHandlerExecute(next)
    ) {
      return;
    }
    console.log('----next', next);
    if (next && next.type) {
      start(next.type);
    }
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
