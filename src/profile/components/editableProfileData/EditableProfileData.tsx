import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import { useVerifiedPersonalInformation } from '../../context/ProfileContext';
import AdditionalInformation from '../additionalInformation/AdditionalInformation';
import AddressEditor from '../addressEditor/AddressEditor';
import BasicData from '../basicData/BasicData';
import EmailEditor from '../emailEditor/EmailEditor';
import PhoneNumberEditor from '../phoneNumberEditor/PhoneNumberEditor';
/**
 * If user has verified personal information, editable data is grouped under "My contact information"
 * Otherwise region is not added, because this is the only data set.
 */
function EditableProfileData() {
  const userIsVerified = !!useVerifiedPersonalInformation();
  const { t } = useTranslation();
  const heading = t('profileInformation.contactInformation');
  const regionProps = userIsVerified
    ? { role: 'region', 'aria-label': heading }
    : {};
  return (
    <div {...regionProps}>
      {userIsVerified && (
        <span
          aria-hidden
          className={classNames(
            commonFormStyles['visually-h2'],
            commonFormStyles['bottom-border']
          )}
        >
          {heading}
        </span>
      )}
      {!userIsVerified && <BasicData />}
      <AddressEditor />
      <ProfileSection>
        <PhoneNumberEditor />
        <hr />
        <EmailEditor />
      </ProfileSection>
      <AdditionalInformation />
    </div>
  );
}

export default EditableProfileData;
