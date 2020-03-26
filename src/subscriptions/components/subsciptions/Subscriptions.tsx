import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Explanation from '../../../common/explanation/Explanation';
import TogglePanel from '../../../common/togglePanel/TogglePanel';
import NotificationComponent from '../../../common/notification/NotificationComponent';
import responsive from '../../../common/cssHelpers/responsive.module.css';
import styles from './Subscriptions.module.css';

function Subscriptions() {
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const { t } = useTranslation();

  const emptyResults = true;
  return (
    <div className={styles.subscriptions}>
      <div className={responsive.maxWidthCentered}>
        <Explanation
          className={styles.pageTitle}
          main={t('subscriptions.title')}
          small={t('subscriptions.explanation')}
        />

        {emptyResults && (
          <p className={styles.empty}>{t('subscriptions.empty')}</p>
        )}

        <TogglePanel
          title="Helsingin kaupungin koronaviestit"
          informationText={t('subscriptions.subscribed')}
        >
          <div></div>
        </TogglePanel>
      </div>

      <NotificationComponent
        show={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}

export default Subscriptions;
