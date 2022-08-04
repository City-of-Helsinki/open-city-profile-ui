import React from 'react';
import { useTranslation } from 'react-i18next';
import FileSaver from 'file-saver';
import * as Sentry from '@sentry/browser';
import { loader } from 'graphql.macro';
import { Button } from 'hds-react';

import styles from './DownloadData.module.css';
import { DownloadMyProfileQuery as DownloadMyProfileRoot } from '../../../graphql/generatedTypes';
import useDownloadProfile from '../../../gdprApi/useDownloadProfile';
import useToast from '../../../toast/useToast';
import ProfileSection from '../../../common/profileSection/ProfileSection';

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
  const onDownloadClick = () => downloadProfileData();

  return (
    <ProfileSection hasVerifiedUserData>
      <h2>{t('downloadData.panelTitle')}</h2>
      <p>{t('downloadData.panelText')}</p>
      <Button
        onClick={onDownloadClick}
        className={styles.button}
        disabled={isDownloadingData}
      >
        {isDownloadingData ? t('loading') : t('downloadData.button')}
      </Button>
    </ProfileSection>
  );
}

export default DownloadData;
