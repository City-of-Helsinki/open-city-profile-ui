import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { loader } from 'graphql.macro';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/browser';

import EditProfileForm, {
  FormValues,
} from '../editProfileForm/EditProfileForm';
import {
  Language,
  MyProfileQuery,
  MyProfileQuery_myProfile_primaryEmail as PrimaryEmail,
  ServiceConnectionsQuery,
  UpdateMyProfile as UpdateMyProfileData,
  UpdateMyProfileVariables,
} from '../../../graphql/generatedTypes';
import NotificationComponent from '../../../common/notification/NotificationComponent';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import getEmailsFromNode from '../../helpers/getEmailsFromNode';
import { updateMutationVariables } from '../../helpers/updateMutationVariables';

const UPDATE_PROFILE = loader('../../graphql/UpdateMyProfile.graphql');
const SERVICE_CONNECTIONS = loader(
  '../../graphql/ServiceConnectionsQuery.graphql'
);

type Props = {
  setEditing: () => void;
  profileData: MyProfileQuery;
};

function EditProfile(props: Props) {
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const { data } = useQuery<ServiceConnectionsQuery>(SERVICE_CONNECTIONS, {
    onError: (error: Error) => {
      Sentry.captureException(error);
      setShowNotification(true);
    },
  });
  const { profileData } = props;
  const { t } = useTranslation();
  const [updateProfile, { loading }] = useMutation<
    UpdateMyProfileData,
    UpdateMyProfileVariables
  >(UPDATE_PROFILE, {
    refetchQueries: ['MyProfileQuery'],
  });

  const handleOnValues = (formValues: FormValues) => {
    const variables: UpdateMyProfileVariables = updateMutationVariables(
      formValues,
      profileData
    );

    updateProfile({ variables })
      .then(result => {
        if (result.data) {
          props.setEditing();
        }
      })
      .catch((error: Error) => {
        Sentry.captureException(error);
        setShowNotification(true);
      });
  };

  return (
    <ProfileSection
      title={t('profileInformation.personalData')}
      description={t('profileInformation.visibility')}
    >
      <EditProfileForm
        setEditing={props.setEditing}
        services={data}
        profile={{
          firstName: profileData?.myProfile?.firstName || '',
          lastName: profileData?.myProfile?.lastName || '',
          profileLanguage: profileData?.myProfile?.language || Language.FINNISH,
          primaryEmail:
            profileData?.myProfile?.primaryEmail || ({} as PrimaryEmail),
          phone: profileData?.myProfile?.primaryPhone?.phone || '',
          address: profileData?.myProfile?.primaryAddress?.address || '',
          city: profileData?.myProfile?.primaryAddress?.city || '',
          postalCode: profileData?.myProfile?.primaryAddress?.postalCode || '',
          countryCode:
            profileData?.myProfile?.primaryAddress?.countryCode || 'FI',
          emails: getEmailsFromNode(profileData),
        }}
        isSubmitting={loading}
        onValues={handleOnValues}
      />
      <NotificationComponent
        show={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </ProfileSection>
  );
}

export default EditProfile;
