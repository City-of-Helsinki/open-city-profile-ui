import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FileSaver from 'file-saver';
import * as Sentry from '@sentry/browser';
import { loader } from 'graphql.macro';
import { Notification } from 'hds-react';

import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import { DownloadMyProfileQuery as DownloadMyProfileRoot } from '../../../graphql/generatedTypes';
import useDownloadProfile from '../../../gdprApi/useDownloadProfile';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import { useScrollIntoView } from '../../hooks/useScrollIntoView';
import StyledButton from '../../../common/styledButton/StyledButton';

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
  const onDownloadClick = () => {
    setError(false);
    downloadProfileData();
  };
  const [scrollIntoViewRef] = useScrollIntoView(loading);

  return (
    <ProfileSection>
      <div className={commonFormStyles['editor-description-container']}>
        <h2 ref={scrollIntoViewRef}>{t('downloadData.panelTitle')}</h2>
        <p>{t('downloadData.panelText')}</p>
      </div>
      <div className={commonFormStyles['uneditable-box-content']}>
        {hasError && (
          <Notification
            label={t('notification.defaultErrorText')}
            type={'error'}
            dataTestId="download-profile-error"
          ></Notification>
        )}
        <StyledButton
          onClick={onDownloadClick}
          disabled={isDownloadingData}
          id="download-profile-button"
        >
          {isDownloadingData ? t('loading') : t('downloadData.button')}
        </StyledButton>
      </div>
    </ProfileSection>
  );
}

export default DownloadData;
