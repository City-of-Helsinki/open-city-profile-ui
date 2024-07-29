import React, { Fragment, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'hds-react';
import classNames from 'classnames';

import authService from '../../../auth/authService';
import useProfile from '../../../auth/useProfile';
import { getAmrStatic, hasPasswordLogin } from './authenticationProviderUtil';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import { ProfileContext } from '../../context/ProfileContext';

function AuthenticationProviderInformation(): React.ReactElement | null {
  const { t } = useTranslation();
  const { profile } = useProfile();

  const { data } = useContext(ProfileContext);

  const hasPassword = hasPasswordLogin(data);

  const amr = getAmrStatic(profile);

  if (!amr) {
    return null;
  }

  const authenticationMethodReferenceName = t(`identityProvider.${amr}`);

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
            <hr />
            <div className={classNames(commonFormStyles['flex-box-rows'])}>
              <div className={commonFormStyles['editor-title-and-value']}>
                <h3 className={commonFormStyles['label-size']}>
                  {t('profileInformation.password')}
                </h3>
              </div>
              <div className={commonFormStyles['edit-buttons-container']}>
                <Button
                  onClick={() => {
                    authService.changePassword();
                  }}
                >
                  {t('profileInformation.changePassword')}
                </Button>
              </div>
            </div>
          </Fragment>
        )}
      </div>
    </ProfileSection>
  );
}

export default AuthenticationProviderInformation;
