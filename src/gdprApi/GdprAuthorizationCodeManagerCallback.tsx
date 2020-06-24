import React from 'react';

import gdprAuthCodeManager from './gdprAuthCodeManager';
import styles from './gdprAuthorizationCodeManagerCallback.module.css';

function GdprAuthorizationCodeManagerCallback() {
  React.useEffect(() => {
    gdprAuthCodeManager.authorizationCodeFetchCallback();
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.fakeNavigation} />
      <div className={styles.fakePageHeading} />
      <div className={styles.fakeContent} />
    </div>
  );
}

export default GdprAuthorizationCodeManagerCallback;
