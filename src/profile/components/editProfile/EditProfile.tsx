import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import { loader } from 'graphql.macro';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import styles from './EditProfile.module.css';
import responsive from '../../../common/cssHelpers/responsive.module.css';
import EditProfileForm, {
  FormValues,
} from '../editProfileForm/EditProfileForm';
import { MyProfileQuery } from '../../graphql/__generated__/MyProfileQuery';
import {
  UpdateMyProfile as UpdateMyProfileData,
  UpdateMyProfileVariables,
} from '../../graphql/__generated__/UpdateMyProfile';
import {
  AddressType,
  PhoneType,
} from '../../../graphql/__generated__/globalTypes';
import Explanation from '../../../common/explanation/Explanation';

const UPDATE_PROFILE = loader('../../graphql/UpdateMyProfile.graphql');

type Props = {
  setEditing: () => void;
  profileData: MyProfileQuery;
};

function EditProfile(props: Props) {
  const { profileData } = props;
  const { t } = useTranslation();
  const [updateProfile, { loading }] = useMutation<
    UpdateMyProfileData,
    UpdateMyProfileVariables
  >(UPDATE_PROFILE, {
    refetchQueries: ['MyProfileQuery'],
  });

  const handleOnValues = (formValues: FormValues) => {
    const variables: UpdateMyProfileVariables = {
      input: {
        profile: {
          firstName: formValues.firstName,
          lastName: formValues.lastName,
          addPhones: [
            !profileData?.myProfile?.primaryPhone?.id && formValues.phone
              ? {
                  phone: formValues.phone,
                  primary: true,
                  phoneType: PhoneType.OTHER,
                }
              : null,
          ],
          updatePhones: [
            profileData?.myProfile?.primaryPhone?.id
              ? {
                  id: profileData.myProfile.primaryPhone.id,
                  phone: formValues.phone,
                  primary: true,
                  phoneType: PhoneType.OTHER,
                }
              : null,
          ],
          addAddresses: [
            !profileData?.myProfile?.primaryAddress?.id &&
            (formValues.address || formValues.postalCode || formValues.city)
              ? {
                  address: formValues.address,
                  city: formValues.city,
                  postalCode: formValues.postalCode,
                  primary: true,
                  addressType: AddressType.OTHER,
                }
              : null,
          ],
          updateAddresses: [
            profileData?.myProfile?.primaryAddress?.id
              ? {
                  id: profileData.myProfile.primaryAddress.id,
                  address: formValues.address,
                  city: formValues.city,
                  postalCode: formValues.postalCode,
                  primary: true,
                  addressType: AddressType.OTHER,
                }
              : null,
          ],
        },
      },
    };
    updateProfile({ variables }).then(result => {
      if (result.data) {
        props.setEditing();
      }
    });
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
            firstName: profileData?.myProfile?.firstName || '',
            lastName: profileData?.myProfile?.lastName || '',
            email: profileData?.myProfile?.primaryEmail?.email || '',
            phone: profileData?.myProfile?.primaryPhone?.phone || '',
            address: profileData?.myProfile?.primaryAddress?.address || '',
            city: profileData?.myProfile?.primaryAddress?.city || '',
            postalCode:
              profileData?.myProfile?.primaryAddress?.postalCode || '',
          }}
          isSubmitting={loading}
          onValues={handleOnValues}
        />
      </div>
    </section>
  );
}

export default EditProfile;
