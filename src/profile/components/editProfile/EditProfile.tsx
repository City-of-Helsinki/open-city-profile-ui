import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import { loader } from 'graphql.macro';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import styles from './EditProfile.module.css';
import responsive from '../../../common/cssHelpers/responsive.module.css';
import EditProfileForm, { FormValues } from '../editProfileForm/EditProfileForm';
import { MyProfileQuery } from '../../graphql/__generated__/MyProfileQuery';
import {
  AddressType,
  EmailType,
  PhoneType
} from '../../../graphql/__generated__/globalTypes';
import Explanation from '../../../common/explanation/Explanation';

type Props = {
  profileData: MyProfileQuery;
}

function EditProfile (props: Props) {
  const { profileData } = props;
  const { t } = useTranslation();

  const handleOnValues = (formValues: FormValues) => {
    /*
    const variables: EditProfileVariables = {
      profile: {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        updateEmails: [
          {
            email: formValues.email,
            primary: true,
            emailType: EmailType.OTHER
          }
        ],
        updatePhones: [
          formValues.phone
          ? {
              phone: formValues.phone,
              primary: true,
              phoneType: PhoneType.OTHER
            }
          : null
        ],
      }
    };
    const address = {
      address: formValues.address,
      city: formValues.city,
      postalCode: formValues.postalCode,
      primary: true,
      addressType: AddressType.OTHER
    };

    if (profileData?.myProfile?.primaryAddress) {
      variables.profile.updateAddresses = [address];
    }
    else {
      variables.profile.addAddresses = [address]
    }

     */
  };

  return (
    <section className={styles.editProfile}>
      <div className={styles.editProfileTitleRow}>
        <div className={classNames(styles.font, responsive.maxWidthCentered)}>
          <Explanation
            main={t('profileInformation.personalData')}
            small={t('profileInformation.visibility')}
          />
        </div>
        <EditProfileForm
          profile={{
            firstName: profileData?.myProfile?.firstName || "",
            lastName: profileData?.myProfile?.lastName || "",
            email: profileData?.myProfile?.primaryEmail?.email || "",
            phone: profileData?.myProfile?.primaryPhone?.phone || "",
            address: profileData?.myProfile?.primaryAddress?.address || "",
            city: profileData?.myProfile?.primaryAddress?.city || "",
            postalCode: profileData?.myProfile?.primaryAddress?.postalCode || "",
          }}
          onValues={handleOnValues}
        />
      </div>
    </section>
  )
}

export default EditProfile;
