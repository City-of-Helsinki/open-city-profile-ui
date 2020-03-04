import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './ProfileDeleted.module.css';
import responsive from '../../../common/cssHelpers/responsive.module.css';
import PageLayout from '../../../common/pageLayout/PageLayout';
import logout from '../../../auth/logout';

function ProfileDeleted() {
  const [timeUntilLogout, setTimeUntilLogout] = useState(10);
  const { t } = useTranslation();

  useEffect(() => {
    if (timeUntilLogout > 0) {
      const interval = setInterval(() => {
        setTimeUntilLogout(time => time - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else logout();
  }, [timeUntilLogout]);

  return (
    <PageLayout>
      <div className={styles.wrapper}>
        <div className={responsive.maxWidthCentered}>
          <div className={styles.content}>
            <h2>{t('profileDeleted.title')}</h2>
            <p>{t('profileDeleted.message', { time: timeUntilLogout })}</p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default ProfileDeleted;
