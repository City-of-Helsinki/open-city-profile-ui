import React from 'react';
import { useTranslation } from 'react-i18next';

import useProfile from '../../../auth/useProfile';
import { getAmrStatic } from './authenticationProviderUtil';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';

function AuthenticationProviderInformation(): React.ReactElement | null {
  const { t } = useTranslation();
  const { profile } = useProfile();

  const amr = getAmrStatic(profile);

  if (!amr) {
    return null;
  }

  const authenticationMethodReferenceName = t(`identityProvider.${amr}`);

  return (
    <ProfileSection>
      <div className={commonFormStyles['flex-box-columns']}>
        <div className={commonFormStyles['editor-description-container']}>
          <h2>{t('profileInformation.authenticationMethod')}</h2>
          <span className={commonFormStyles['text-value']}>
            {authenticationMethodReferenceName}
          </span>
        </div>
      </div>
    </ProfileSection>
  );
}

export default AuthenticationProviderInformation;
