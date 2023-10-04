import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Notification } from 'hds-react';

import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import contentStyles from '../../../common/cssHelpers/content.module.css';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import { useScrollIntoView } from '../../hooks/useScrollIntoView';
import StyledButton from '../../../common/styledButton/StyledButton';
import useDownloadProfileQueue from '../../../gdprApi/useDownloadProfileQueue';

function DownloadData(): React.ReactElement {
  const {
    startOrRestart,
    canStart,
    shouldRestart,
    hasError,
    isLoading,
    shouldResumeDownload,
    resume,
  } = useDownloadProfileQueue();
  const canUserDoSomething = canStart() || shouldRestart();
  const { t } = useTranslation();
  const onDownloadClick = () => {
    startOrRestart();
  };
  useEffect(() => {
    if (shouldResumeDownload()) {
      resume();
    }
  }, [shouldResumeDownload, resume]);
  const [scrollIntoViewRef] = useScrollIntoView(isLoading || hasError);
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
            disabled={!canUserDoSomething}
            id="download-profile-button"
          >
            {!canUserDoSomething ? t('loading') : t('downloadData.button')}
          </StyledButton>
        </div>
      </div>
    </ProfileSection>
  );
}

export default DownloadData;
