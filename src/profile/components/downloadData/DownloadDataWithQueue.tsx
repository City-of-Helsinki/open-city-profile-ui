import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FileSaver from 'file-saver';
import * as Sentry from '@sentry/browser';
import { loader } from 'graphql.macro';
import { Notification } from 'hds-react';

import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import contentStyles from '../../../common/cssHelpers/content.module.css';
import { DownloadMyProfileQuery as DownloadMyProfileRoot } from '../../../graphql/generatedTypes';
import useDownloadProfile from '../../../gdprApi/useDownloadProfile';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import { useScrollIntoView } from '../../hooks/useScrollIntoView';
import StyledButton from '../../../common/styledButton/StyledButton';
import { useDownloadProfileQueueD } from '../../../gdprApi/useDownloadProfileQueue';

const ALL_DATA = loader('../../graphql/DownloadMyProfileQuery.graphql');

function DownloadData(): React.ReactElement {
  const [hasError, setError] = useState(false);

  const { start } = useDownloadProfileQueueD();
  const { t } = useTranslation();
  const isDownloadingData = false;
  const onDownloadClick = () => {
    setError(false);
    // downloadProfileData();
    start();
  };
  const [scrollIntoViewRef] = useScrollIntoView(false);

  return (
    <ProfileSection borderless>
      <div className={commonFormStyles['editor-description-container']}>
        <h2 ref={scrollIntoViewRef}>{t('downloadData.panelTitle')}</h2>
        <p>{t('downloadData.panelText')}</p>
      </div>
      <div className={commonFormStyles['uneditable-box-content']}>
        <div className={contentStyles['common-child-vertical-spacing']}>
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
      </div>
    </ProfileSection>
  );
}

export default DownloadData;
