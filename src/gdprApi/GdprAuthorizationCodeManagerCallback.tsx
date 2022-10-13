import React from 'react';

import gdprAuthCodeManager from './gdprAuthCodeManager';
import styles from './gdprAuthorizationCodeManagerCallback.module.css';

function GdprAuthorizationCodeManagerCallback(): React.ReactElement {
  React.useEffect(() => {
    gdprAuthCodeManager.notifyParentWindow();
  }, []);

  return (
    <div className={styles['wrapper']}>
      <div className={styles['fake-navigation']} />
      <div className={styles['fake-page-heading']} />
      <div className={styles['fake-content']} />
    </div>
  );
}

export default GdprAuthorizationCodeManagerCallback;
