import React, { Fragment, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  StatusLabel,
  IconCheckCircle,
  IconInfoCircle,
  IconCrossCircle,
} from 'hds-react';
import classNames from 'classnames';

import { getMFALoginMethod, formatDate } from './authenticationProviderUtil';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import { ProfileContext } from '../../context/ProfileContext';
import useNotificationContent from '../editingNotifications/useNotificationContent';
import EditingNotifications from '../editingNotifications/EditingNotifications';
import useAuth from '../../../auth/useAuth';

function OtpInformation(): React.ReactElement | null {
  const { t } = useTranslation();

  const {
    data,
    otpConfigurationState,
    setOtpConfigurationState,
    otpDeleteState,
    setOtpDeleteState,
  } = useContext(ProfileContext);

  const MFALoginMethod = getMFALoginMethod(data);

  const showOtpSuccess = otpConfigurationState;

  const { content, setSuccessMessage } = useNotificationContent();
  const { initiateTOTP, disableTOTP } = useAuth();

  useEffect(() => {
    if (showOtpSuccess) {
      setSuccessMessage('save');
      setOtpConfigurationState(false);
    }

    if (otpDeleteState) {
      setSuccessMessage('remove');
      setOtpDeleteState(false);
    }
  }, [
    showOtpSuccess,
    setOtpConfigurationState,
    setSuccessMessage,
    otpDeleteState,
    setOtpDeleteState,
  ]);

  const flexBoxColumns = 'responsive-flex-box-columns-rows';

  return (
    <Fragment>
      <div
        className={classNames(
          commonFormStyles[flexBoxColumns],
          commonFormStyles['password-container']
        )}
      >
        <div
          className={classNames(
            commonFormStyles['editor-title-and-value'],
            commonFormStyles[flexBoxColumns]
          )}
        >
          <div>
            <h3 className={commonFormStyles['subtitle-size']}>
              {t('mfa.title')}
            </h3>

            {!MFALoginMethod && (
              <StatusLabel iconLeft={<IconInfoCircle />}>
                {t('mfa.disabled')}
              </StatusLabel>
            )}
            {MFALoginMethod && (
              <StatusLabel type="success" iconLeft={<IconCheckCircle />}>
                {t('mfa.dateEnabled')} {formatDate(MFALoginMethod.createdAt)}
              </StatusLabel>
            )}
          </div>
        </div>
        <div className={commonFormStyles['edit-buttons']}>
          <div className={commonFormStyles['edit-buttons-container']}>
            {!MFALoginMethod && (
              <Button
                data-testid={'enable-totp-button'}
                onClick={() => {
                  initiateTOTP();
                }}
              >
                {t('mfa.enable')}
              </Button>
            )}
            {MFALoginMethod && (
              <Button
                data-testid={'disable-totp-button'}
                iconLeft={<IconCrossCircle />}
                variant="secondary"
                onClick={() => {
                  disableTOTP(MFALoginMethod.credentialId);
                }}
              >
                {t('mfa.disable')}
              </Button>
            )}
          </div>
        </div>
      </div>
      <EditingNotifications content={content} dataType={'totp'} />
    </Fragment>
  );
}

export default OtpInformation;
