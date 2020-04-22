import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loader } from 'graphql.macro';
import { useLazyQuery } from '@apollo/react-hooks';
import * as Sentry from '@sentry/browser';

import Button from '../../../common/button/Button';
import ExpandingPanel from '../../../common/expandingPanel/ExpandingPanel';
import NotificationComponent from '../../../common/notification/NotificationComponent';
import styles from './DownloadData.module.css';
import { DownloadMyProfile } from '../../../graphql/generatedTypes';

const ALL_DATA = loader('../../graphql/DownloadMyProfile.graphql');

type Props = {};

function DownloadData(props: Props) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const [loadData] = useLazyQuery<DownloadMyProfile>(ALL_DATA, {
    onCompleted: data => {
      const a = document.createElement('a');
      a.style.display = 'none';
      document.body.appendChild(a);
      a.href = window.URL.createObjectURL(
        new Blob([data.downloadMyProfile], { type: 'application/json' })
      );
      a.setAttribute('download', 'helsinkiprofile_data.json');
      a.click();
      window.URL.revokeObjectURL(a.href);
      document.body.removeChild(a);
      setIsLoading(false);
    },
    onError: (error: Error) => {
      Sentry.captureException(error);
      setShowNotification(true);
    },
    fetchPolicy: 'network-only',
  });
  const downloadData = () => {
    setIsLoading(true);
    loadData();
  };
  return (
    <React.Fragment>
      <ExpandingPanel title={t('downloadData.panelTitle')}>
        <p>{t('downloadData.panelText')}</p>
        <Button
          onClick={downloadData}
          className={styles.button}
          disabled={isLoading}
        >
          {isLoading ? t('loading') : t('downloadData.button')}
        </Button>
      </ExpandingPanel>

      <NotificationComponent
        show={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </React.Fragment>
  );
}

export default DownloadData;
