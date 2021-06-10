import React, { useContext } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { IconCheckCircleFill } from 'hds-react';
import classNames from 'classnames';

import styles from './VerifiedPersonalInformation.module.css';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import { ProfileContext } from '../../context/ProfileContext';
import getCountry from '../../helpers/getCountry';
import {
  PermanentForeignAddress,
  PermanentAddress,
} from '../../../graphql/typings';
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
  const { data } = useContext(ProfileContext);

  const { t, i18n } = useTranslation();
  const lang = i18n.languages[0];

  const verifiedPersonalInformation = getVerifiedPersonalInformation(data);

  if (!verifiedPersonalInformation) {
    return null;
  }

  const verifiedInfoText = t('profileInformation.verifiedData');

  const {
    firstName,
    givenName,
    lastName,
    permanentAddress,
    temporaryAddress,
    permanentForeignAddress,
    nationalIdentificationNumber,
    municipalityOfResidence,
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
        <h3
          className={commonFormStyles.sectionTitle}
          data-testid={`vpi-address-${type}`}
        >
          {type === 'permanent'
            ? t('profileInformation.permanentAddress')
            : type === 'temporary'
            ? t('profileInformation.temporaryAddress')
            : t('profileInformation.permanentForeignAddress')}
        </h3>
        <div className={commonFormStyles.multiItemWrapper}>
          <LabeledValue
            label={t('profileForm.address')}
            value={address.streetAddress}
            verifiedInfoText={verifiedInfoText}
          />
          {address.additionalAddress && (
            <LabeledValue
              label={t('profileForm.additionalInfo')}
              value={address.additionalAddress}
              verifiedInfoText={verifiedInfoText}
            />
          )}
          {address.postalCode && (
            <LabeledValue
              label={t('profileForm.postalCode')}
              value={address.postalCode}
              verifiedInfoText={verifiedInfoText}
            />
          )}
          {address.postOffice && (
            <LabeledValue
              label={t('profileForm.postOffice')}
              value={address.postOffice}
              verifiedInfoText={verifiedInfoText}
            />
          )}
          {country && (
            <LabeledValue
              label={t('profileForm.country')}
              value={country}
              verifiedInfoText={verifiedInfoText}
            />
          )}
        </div>
      </React.Fragment>
    );
  };

  const LongDescription = ({ forAria }: { forAria?: boolean }) => (
    <p className={forAria ? commonFormStyles.visuallyHidden : ''}>
      <Trans
        i18nKey="profileInformation.verifiedDataInformation"
        components={[
          forAria
            ? t('profileInformation.verifiedDataInformationAriaPrefix')
            : t('profileInformation.verifiedDataInformationPrefix'),
          // eslint-disable-next-line jsx-a11y/anchor-has-content
          <a
            href={t('profileInformation.verifiedDataInformationLink')}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={forAria ? 0 : -1}
          />,
        ]}
      />
    </p>
  );

  return (
    <ProfileSection hasVerifiedUserData>
      <h3
        className={commonFormStyles.sectionTitle}
        aria-label={t('profileInformation.verifiedBasicData')}
      >
        {t('profileForm.basicData')}
      </h3>
      <LongDescription forAria />
      <div className={commonFormStyles.multiItemWrapper}>
        <LabeledValue
          label={t('profileForm.firstName')}
          value={firstName}
          verifiedInfoText={verifiedInfoText}
        />
        <LabeledValue
          label={t('profileForm.givenName')}
          value={givenName}
          verifiedInfoText={verifiedInfoText}
        />
        <LabeledValue
          label={t('profileForm.lastName')}
          value={lastName}
          verifiedInfoText={verifiedInfoText}
        />
        <LabeledValue
          label={t('profileForm.nationalIdentificationNumber')}
          value={nationalIdentificationNumber}
          verifiedInfoText={verifiedInfoText}
        />
        <LabeledValue
          label={t('profileForm.municipalityOfResidence')}
          value={municipalityOfResidence}
          verifiedInfoText={verifiedInfoText}
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
      <div
        className={classNames([styles.verifiedDataIconInformation])}
        id="verified-data-information"
        aria-hidden="true"
      >
        <span className={commonFormStyles.icon}>
          <IconCheckCircleFill />
        </span>
        <LongDescription />
      </div>
    </ProfileSection>
  );
}

export default VerifiedPersonalInformation;
