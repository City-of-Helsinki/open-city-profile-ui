import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FileSaver from 'file-saver';
import * as Sentry from '@sentry/browser';
import { loader } from 'graphql.macro';
import { Button, Notification } from 'hds-react';

import ExpandingPanel from '../../../common/expandingPanel/ExpandingPanel';
import styles from './DownloadData.module.css';
import { DownloadMyProfileQuery as DownloadMyProfileRoot } from '../../../graphql/generatedTypes';
import useDownloadProfile from '../../../gdprApi/useDownloadProfile';

const ALL_DATA = loader('../../graphql/DownloadMyProfileQuery.graphql');

function DownloadData(): React.ReactElement {
  const [hasError, setError] = useState(false);
  const [downloadProfileData, , loading] = useDownloadProfile<
    DownloadMyProfileRoot
  >(ALL_DATA, {
    onCompleted: returnedData => {
      const blob = new Blob([returnedData.downloadMyProfile], {
        type: 'application/json',
      });
      FileSaver.saveAs(blob, 'helsinkiprofile_data.json');
    },
    onError: (error: Error) => {
      Sentry.captureException(error);
      setError(true);
    },
    fetchPolicy: 'network-only',
  });
  const { t } = useTranslation();
  const isDownloadingData = loading;
  const initiallyOpen = loading;
  const onDownloadClick = () => {
    setError(false);
    downloadProfileData();
  };
  return (
    <React.Fragment>
      <ExpandingPanel
        title={t('downloadData.panelTitle')}
        initiallyOpen={initiallyOpen}
        scrollIntoViewOnMount={initiallyOpen}
      >
        <p>{t('downloadData.panelText')}</p>
        {hasError && (
          <Notification
            label={t('notification.defaultErrorText')}
            type={'error'}
          ></Notification>
        )}
        <Button
          onClick={onDownloadClick}
          className={styles.button}
          disabled={isDownloadingData}
        >
          {isDownloadingData ? t('loading') : t('downloadData.button')}
        </Button>
      </ExpandingPanel>
    </React.Fragment>
  );
}

export default DownloadData;
