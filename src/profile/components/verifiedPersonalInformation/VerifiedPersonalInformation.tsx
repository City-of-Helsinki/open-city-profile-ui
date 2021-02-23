import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconCheckCircleFill } from 'hds-react';
import classNames from 'classnames';

import styles from './VerifiedPersonalInformation.module.css';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import { useProfileQuery } from '../../helpers/hooks';
import getCountry from '../../helpers/getCountry';
import {
  MyProfileQuery_myProfile_verifiedPersonalInformation_permanentForeignAddress as PermanentForeignAddress,
  MyProfileQuery_myProfile_verifiedPersonalInformation_permanentAddress as PermanentAddress,
} from '../../../graphql/generatedTypes';
import getVerifiedPersonalInformation from '../../helpers/getVerifiedPersonalInformation';

type CommonAddress = {
  streetAddress: PermanentAddress['streetAddress'];
  postOffice?: PermanentAddress['postOffice'];
  postalCode?: PermanentAddress['postalCode'];
  additionalAddress?: PermanentForeignAddress['additionalAddress'];
  countryCode?: PermanentForeignAddress['countryCode'];
  __typename: string;
};

type AddressProps = {
  type: 'permanent' | 'temporary' | 'foreign';
  address: CommonAddress;
};

function VerifiedPersonalInformation(): React.ReactElement | null {
  const { data } = useProfileQuery();

  const { t, i18n } = useTranslation();
  const lang = i18n.languages[0];

  const verifiedPersonalInformation = getVerifiedPersonalInformation(data);

  if (!verifiedPersonalInformation) {
    return null;
  }

  const {
    firstName,
    givenName,
    lastName,
    permanentAddress,
    temporaryAddress,
    permanentForeignAddress,
  } = verifiedPersonalInformation;

  const AddressComponent = (props: AddressProps): React.ReactElement | null => {
    const { type } = props;
    const address = props.address;
    if (!address) {
      return null;
    }
    const country = getCountry(address.countryCode, lang);
    return (
      <React.Fragment key={type}>
        <h3 className={commonFormStyles.sectionTitle}>
          {type === 'permanent'
            ? 'Vakinainen osoite'
            : type === 'temporary'
            ? 'Väliaikainen osoite'
            : 'Vakinainen ulkomainen osoite'}
        </h3>
        <div className={commonFormStyles.storedInformation}>
          <LabeledValue
            label={t('profileForm.address')}
            value={address.streetAddress}
            showCheckIcon
          />
          {address.additionalAddress && (
            <LabeledValue
              label={t('profileForm.additionalAddress')}
              value={address.additionalAddress}
              showCheckIcon
            />
          )}
          {address.postalCode && (
            <LabeledValue
              label={t('profileForm.postalCode')}
              value={address.postalCode}
              showCheckIcon
            />
          )}
          {address.postOffice && (
            <LabeledValue
              label={t('profileForm.postOffice')}
              value={address.postOffice}
              showCheckIcon
            />
          )}
          {country && (
            <LabeledValue
              label={t('profileForm.country')}
              value={country}
              showCheckIcon
            />
          )}
        </div>
      </React.Fragment>
    );
  };

  return (
    <ProfileSection title={''} hasVerifiedUserData>
      <h3 className={commonFormStyles.sectionTitle}>Perustiedot</h3>
      <div className={commonFormStyles.storedInformation}>
        <LabeledValue
          label={t('profileForm.firstName')}
          value={firstName}
          showCheckIcon
        />
        <LabeledValue
          label={t('profileForm.givenName')}
          value={givenName}
          showCheckIcon
        />
        <LabeledValue
          label={t('profileForm.lastName')}
          value={lastName}
          showCheckIcon
        />
      </div>
      <AddressComponent
        type="permanent"
        address={permanentAddress as CommonAddress}
      />
      <AddressComponent
        type="temporary"
        address={temporaryAddress as CommonAddress}
      />
      <AddressComponent
        type="foreign"
        address={permanentForeignAddress as CommonAddress}
      />
      <div className={classNames([styles.verifiedDataIconInformation])}>
        <span className={commonFormStyles.icon}>
          <IconCheckCircleFill />
        </span>
        <p>{t('profileForm.verifiedDataIconInformation')}</p>
      </div>
    </ProfileSection>
  );
}

export default VerifiedPersonalInformation;
