import React, { Fragment, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  IconLinkExternal,
  StatusLabel,
  IconCheckCircle,
  IconInfoCircle,
  IconCrossCircle,
} from 'hds-react';
import classNames from 'classnames';

import useProfile from '../../../auth/useProfile';
import {
  getAmrStatic,
  hasPasswordLogin,
  getMFALoginMethod,
  formatDate,
} from './authenticationProviderUtil';
import OtpInformation from './OtpInformation';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import { ProfileContext } from '../../context/ProfileContext';
import useNotificationContent from '../editingNotifications/useNotificationContent';
import EditingNotifications from '../editingNotifications/EditingNotifications';
import useAuth from '../../../auth/useAuth';
import config from '../../../config';

function AuthenticationProviderInformation(): React.ReactElement | null {
  const { t } = useTranslation();
  const { profile } = useProfile();

  const {
    data,
    passwordUpdateState,
    setPasswordUpdateState,
    otpConfigurationState,
    setOtpConfigurationState,
  } = useContext(ProfileContext);

  const hasPassword = hasPasswordLogin(data);
  const MFALoginMethod = getMFALoginMethod(data);
  const amr = getAmrStatic(profile);
  const showSuccess = passwordUpdateState;
  const showOtpSuccess = otpConfigurationState;
  const { content, setSuccessMessage } = useNotificationContent();
  const { changePassword, initiateTOTP, disableTOTP } = useAuth();

  useEffect(() => {
    if (showSuccess) {
      setSuccessMessage('save');
      setPasswordUpdateState(false);
    }
  }, [showSuccess, setPasswordUpdateState, setSuccessMessage]);
  /*
  useEffect(() => {
    if (showOtpSuccess) {
      setSuccessMessage('save');
      setOtpConfigurationState(false);
    }
  }, [showOtpSuccess, setOtpConfigurationState, setSuccessMessage]); */

  if (!amr) {
    return null;
  }

  const authenticationMethodReferenceName = t(`identityProvider.${amr}`);

  const flexBoxColumns = 'responsive-flex-box-columns-rows';

  return (
    <ProfileSection>
      <div className={commonFormStyles['flex-box-columns']}>
        <div
          className={classNames(
            commonFormStyles['editor-description-container']
          )}
        >
          <h2>{t('profileInformation.loginAndAuthentication')}</h2>
          <span>{authenticationMethodReferenceName}</span>
        </div>

        {hasPassword && (
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
                  commonFormStyles['responsive-flex-box-columns-rows']
                )}
              >
                <h3 className={commonFormStyles['subtitle-size']}>
                  {t('profileInformation.password')}
                </h3>
              </div>
              <div className={commonFormStyles['edit-buttons']}>
                <div className={commonFormStyles['edit-buttons-container']}>
                  <Button
                    iconRight={<IconLinkExternal />}
                    data-testid={'change-password-button'}
                    onClick={() => {
                      changePassword();
                    }}
                  >
                    {t('profileInformation.changePassword')}
                  </Button>
                </div>
              </div>
            </div>
            <EditingNotifications content={content} dataType={'password'} />

            {config.mfa && <OtpInformation />}
          </Fragment>
        )}
      </div>
    </ProfileSection>
  );
}

export default AuthenticationProviderInformation;
