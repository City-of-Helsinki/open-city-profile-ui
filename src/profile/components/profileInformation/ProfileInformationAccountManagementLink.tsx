import React from 'react';
import { IconAngleRight, IconProps } from 'hds-react';
import { useTranslation } from 'react-i18next';

import useProfile from '../../../auth/useProfile';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import {
  getAmrStatic,
  getAmrUrl,
} from './profileInformationAccountManagementLinkUtils';
import styles from './profileInformationAccountManagementLink.module.css';
import { Link } from '../../../common/copyOfHDSLink/Link';

function ProfileInformationAccountManagementLink(): React.ReactElement | null {
  const { t } = useTranslation();
  const { profile } = useProfile();

  const amr = getAmrStatic(profile);

  if (!amr) {
    return null;
  }

  const authenticationMethodReferenceUrl = getAmrUrl(amr);
  const authenticationMethodReferenceName = t(`identityProvider.${amr}`);

  const LinkIcon = (props: IconProps) => (
    <IconAngleRight {...props} size={'s'} />
  );
  return (
    <div className={styles['container']}>
      <div className={styles['label-section']}>
        <LabeledValue
          label={t('profileInformation.authenticationMethod')}
          value={authenticationMethodReferenceName}
        />
      </div>
      <div className={styles['link']}>
        <Link
          href={authenticationMethodReferenceUrl}
          iconReplacement={LinkIcon}
          external
          openInNewTab
        >
          {t('profileInformation.doGoToAccountManagement')}
        </Link>
      </div>
    </div>
  );
}

export default ProfileInformationAccountManagementLink;
