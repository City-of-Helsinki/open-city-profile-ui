import React from 'react';
import { IconAngleRight } from 'hds-react';
import { useTranslation } from 'react-i18next';

import useProfile from '../../../auth/useProfile';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import {
  getAmr,
  getAmrUrl,
} from './profileInformationAccountManagementLinkUtils';
import styles from './profileInformationAccountManagementLink.module.css';

function ProfileInformationAccountManagementLink() {
  const { t } = useTranslation();
  const { profile } = useProfile();

  const amr = getAmr(profile);

  if (!amr) {
    return null;
  }

  const authenticationMethodReferenceUrl = getAmrUrl(amr);
  const authenticationMethodReferenceName = t(`identityProvider.${amr}`);

  return (
    <div className={styles.container}>
      <div className={styles.labelSection}>
        <LabeledValue
          label={t('profileInformation.authenticationMethod')}
          value={authenticationMethodReferenceName}
        />
      </div>
      <div className={styles.link}>
        <a
          href={authenticationMethodReferenceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('profileInformation.doGoToAccountManagement')} <IconAngleRight />
        </a>
      </div>
    </div>
  );
}

export default ProfileInformationAccountManagementLink;
