import React from 'react';
import { useTranslation } from 'react-i18next';
import FileSaver from 'file-saver';
import * as Sentry from '@sentry/browser';
import { loader } from 'graphql.macro';
import { Button } from 'hds-react';

import ExpandingPanel from '../../../common/expandingPanel/ExpandingPanel';
import styles from './DownloadData.module.css';
import { DownloadMyProfileQuery as DownloadMyProfileRoot } from '../../../graphql/generatedTypes';
import useDownloadProfile from '../../../gdprApi/useDownloadProfile';
import useToast from '../../../toast/useToast';

const ALL_DATA = loader('../../graphql/DownloadMyProfileQuery.graphql');

function DownloadData(): React.ReactElement {
  const { createToast } = useToast();
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
      createToast({ type: 'error' });
    },
    fetchPolicy: 'network-only',
  });
  const { t } = useTranslation();
  const isDownloadingData = loading;
  const isOpenByDefault = loading;
  const onDownloadClick = downloadProfileData;

  return (
    <React.Fragment>
      <ExpandingPanel
        title={t('downloadData.panelTitle')}
        defaultExpanded={isOpenByDefault}
        scrollIntoViewOnMount={isOpenByDefault}
      >
        <p>{t('downloadData.panelText')}</p>
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
