import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import classNames from 'classnames';
import { Link } from 'hds-react';

import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import profileSectionStyles from '../../../common/profileSection/profileSection.module.css';
import commonStyles from '../../../common/cssHelpers/common.module.css';
import { useVerifiedPersonalInformation } from '../../context/ProfileContext';
import getCountry from '../../helpers/getCountry';
import {
  PermanentForeignAddress,
  PermanentAddress,
} from '../../../graphql/typings';

type CommonAddress = {
  streetAddress: PermanentAddress['streetAddress'];
  postOffice?: PermanentAddress['postOffice'];
  postalCode?: PermanentAddress['postalCode'];
  additionalAddress?: PermanentForeignAddress['additionalAddress'];
  countryCode?: PermanentForeignAddress['countryCode'];
  __typename: string;
};

type AddressProps = {
  type: 'permanent' | 'foreign';
  address: CommonAddress;
};

function VerifiedPersonalInformation(): React.ReactElement | null {
  const verifiedPersonalInformation = useVerifiedPersonalInformation();

  const { t, i18n } = useTranslation();
  const lang = i18n.languages[0];

  if (!verifiedPersonalInformation) {
    return null;
  }

  const {
    firstName,
    givenName,
    lastName,
    permanentAddress,
    permanentForeignAddress,
    nationalIdentificationNumber,
    municipalityOfResidence,
  } = verifiedPersonalInformation;

  const containerStyles = classNames(
    commonFormStyles['responsive-flex-box-columns-rows'],
    commonFormStyles['responsive-width-text-fields']
  );

  const AddressComponent = (props: AddressProps): React.ReactElement | null => {
    const { type } = props;
    const address = props.address;
    if (!address) {
      return null;
    }
    const country = getCountry(address.countryCode, lang);
    return (
      <React.Fragment key={type}>
        <div className={containerStyles} data-testid={`vpi-address-${type}`}>
          <LabeledValue
            label={t('profileForm.address')}
            value={address.streetAddress}
          />
          {address.additionalAddress && (
            <LabeledValue
              label={t('profileForm.additionalInfo')}
              value={address.additionalAddress}
            />
          )}
          {address.postalCode && (
            <LabeledValue
              label={t('profileForm.postalCode')}
              value={address.postalCode}
            />
          )}
          {address.postOffice && (
            <LabeledValue
              label={t('profileForm.postOffice')}
              value={address.postOffice}
            />
          )}
          {country && (
            <LabeledValue label={t('profileForm.country')} value={country} />
          )}
        </div>
      </React.Fragment>
    );
  };

  const LongDescription = () => (
    <p>
      <Trans
        i18nKey={'profileInformation.verifiedDataInformation'}
        components={{
          suomiFiLink: (
            <Link
              href={t('profileInformation.verifiedDataInformationLink')}
              external
              openInNewTab
            >
              {''}
            </Link>
          ),
        }}
      />
    </p>
  );

  return (
    <div
      role="region"
      aria-labelledby="verified-personal-information-heading"
      className={classNames(
        commonStyles['content-box'],
        profileSectionStyles['profile-section'],
        commonStyles['bottom-border'],
        commonFormStyles['mobile-no-bottom-padding']
      )}
    >
      <div
        className={classNames(
          commonFormStyles['editor-description-container'],
          commonFormStyles['bottom-border']
        )}
      >
        <h2
          id="verified-personal-information-heading"
          className={commonFormStyles['normal-size']}
        >
          {t('profileInformation.verifiedBasicData')}
        </h2>
        <LongDescription />
      </div>
      <div className={commonFormStyles['flex-box-columns']}>
        <div
          className={classNames(
            containerStyles,
            commonFormStyles['mobile-xs-top-padding']
          )}
        >
          <LabeledValue label={t('profileForm.firstName')} value={firstName} />
          <LabeledValue label={t('profileForm.givenName')} value={givenName} />
          <LabeledValue label={t('profileForm.lastName')} value={lastName} />
        </div>
        <div className={containerStyles}>
          <LabeledValue
            label={t('profileForm.nationalIdentificationNumber')}
            value={nationalIdentificationNumber}
          />
          <LabeledValue
            label={t('profileForm.municipalityOfResidence')}
            value={municipalityOfResidence}
          />
        </div>
        <AddressComponent
          type="permanent"
          address={permanentAddress as CommonAddress}
        />
        <AddressComponent
          type="foreign"
          address={permanentForeignAddress as CommonAddress}
        />
      </div>
    </div>
  );
}

export default VerifiedPersonalInformation;
