import React, { Fragment, useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, useOidcClient } from 'hds-react';
import classNames from 'classnames';

import { getAmrStatic, hasPasswordLogin } from './authenticationProviderUtil';
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
  const notificationRef = useRef<HTMLDivElement>(null);

  const { data, passwordUpdateState, setPasswordUpdateState } = useContext(ProfileContext);

  const hasPassword = hasPasswordLogin(data);
  const { getAmr } = useOidcClient();
  const amr = getAmrStatic(getAmr());
  const showSuccess = passwordUpdateState;
  const { content, setSuccessMessage } = useNotificationContent();
  const { changePassword } = useAuth();

  useEffect(() => {
    if (showSuccess) {
      setSuccessMessage('save');
      setPasswordUpdateState(false);

      // Scrolling needs timeout because the notification is not yet rendered
      setTimeout(() => {
        if (notificationRef.current) {
          notificationRef.current.scrollIntoView({
            behavior: 'auto',
            block: 'center',
          });
        }
      }, 0);
    }
  }, [showSuccess, setPasswordUpdateState, setSuccessMessage]);

  if (!amr) {
    return null;
  }

  const authenticationMethodReferenceName = t(`identityProvider.${amr}`);

  const flexBoxColumns = 'responsive-flex-box-columns-rows';

  return (
    <ProfileSection>
      <div className={commonFormStyles['flex-box-columns']}>
        <div className={classNames(commonFormStyles['editor-description-container'])}>
          <h2>{t('profileInformation.loginAndAuthentication')}</h2>
          <span>{authenticationMethodReferenceName}</span>
        </div>

        {hasPassword && (
          <Fragment>
            <div className={classNames(commonFormStyles[flexBoxColumns], commonFormStyles['password-container'])}>
              <div
                className={classNames(
                  commonFormStyles['editor-title-and-value'],
                  commonFormStyles['responsive-flex-box-columns-rows'],
                )}
              >
                <h3 className={commonFormStyles['subtitle-size']}>{t('profileInformation.password')}</h3>
              </div>
              <div className={commonFormStyles['edit-buttons']}>
                <div className={commonFormStyles['edit-buttons-container']}>
                  <Button
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
            <EditingNotifications ref={notificationRef} content={content} dataType={'password'} bottomSpacing />

            {config.mfa && <OtpInformation />}
          </Fragment>
        )}
      </div>
    </ProfileSection>
  );
}

export default AuthenticationProviderInformation;
