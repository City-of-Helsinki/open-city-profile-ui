import React from 'react';
import { useTranslation } from 'react-i18next';

import useProfile from '../../../auth/useProfile';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import { getAmrStatic } from './authenticationProviderUtil';
import styles from './authenticationProviderInformation.module.css';

function AuthenticationProviderInformation(): React.ReactElement | null {
  const { t } = useTranslation();
  const { profile } = useProfile();

  const amr = getAmrStatic(profile);

  if (!amr) {
    return null;
  }

  const authenticationMethodReferenceName = t(`identityProvider.${amr}`);

  return (
    <div className={styles['container']}>
      <div className={styles['label-section']}>
        <LabeledValue
          label={t('profileInformation.authenticationMethod')}
          value={authenticationMethodReferenceName}
        />
      </div>
    </div>
  );
}

export default AuthenticationProviderInformation;
