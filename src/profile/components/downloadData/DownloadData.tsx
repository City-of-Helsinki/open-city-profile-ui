import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Notification, IconDownload } from 'hds-react';

import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import contentStyles from '../../../common/cssHelpers/content.module.css';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import { useScrollIntoView } from '../../hooks/useScrollIntoView';
import useAuthCodeQueues, {
  AuthCodeQueuesProps,
} from '../../../gdprApi/useAuthCodeQueues';
import config from '../../../config';
import { isInsufficientLoaResult } from '../../../gdprApi/actions/getDownloadData';
import { QueueController } from '../../../common/actionQueue/actionQueue';

function DownloadData(): React.ReactElement {
  const [errorMessage, setErrorMessage] = useState<string>();

  const onError: AuthCodeQueuesProps['onError'] = useCallback(
    (controller: QueueController) => {
      const failed = controller.getFailed();
      const message = (failed && failed.errorMessage) || 'unknown';

      setErrorMessage(message);
    },
    []
  );

  const {
    startOrRestart,
    canStart,
    shouldRestart,
    hasError,
    isLoading,
    shouldResumeWithAuthCodes,
    resume,
  } = useAuthCodeQueues({
    startPagePath: config.downloadPath,
    queueName: 'downloadProfile',
    onError,
  });
  const canUserDoSomething = canStart() || shouldRestart();
  const { t } = useTranslation();
  const onDownloadClick = () => {
    startOrRestart();
  };
  useEffect(() => {
    if (shouldResumeWithAuthCodes()) {
      resume();
    }
  }, [shouldResumeWithAuthCodes, resume]);
  const [scrollIntoViewRef] = useScrollIntoView(isLoading || hasError);
  return (
    <ProfileSection borderless>
      <div className={commonFormStyles['editor-description-container']}>
        <h2 ref={scrollIntoViewRef}>{t('downloadData.panelTitle')}</h2>
        <p>{t('downloadData.panelText')}</p>
      </div>
      <div className={commonFormStyles['uneditable-box-content']}>
        <div className={contentStyles['common-child-vertical-spacing']}>
          {hasError &&
            (isInsufficientLoaResult({ errorMessage, result: undefined }) ? (
              <Notification
                size="small"
                label={t('downloadData.extrapanelTextforLightAuthentication')}
                type={'error'}
                dataTestId="download-profile-insufficient-loa-error"
              >
                {t('downloadData.extrapanelTextforLightAuthentication')}
              </Notification>
            ) : (
              <Notification
                size="small"
                label=" "
                type={'error'}
                dataTestId="download-profile-error"
              >
                {t('notification.defaultErrorText')}
              </Notification>
            ))}
          <Button
            iconLeft={<IconDownload />}
            onClick={onDownloadClick}
            disabled={!canUserDoSomething}
            id="download-profile-button"
          >
            {!canUserDoSomething ? t('loading') : t('downloadData.button')}
          </Button>
        </div>
      </div>
    </ProfileSection>
  );
}

export default DownloadData;
