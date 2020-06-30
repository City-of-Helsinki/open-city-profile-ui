import React, { useEffect } from 'react';
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
  MyProfileQuery_myProfile_primaryAddress as PrimaryAddress,
  MyProfileQuery_myProfile_primaryPhone as PrimaryPhone,
  ServiceConnectionsQuery,
  UpdateMyProfile as UpdateMyProfileData,
  UpdateMyProfileVariables,
} from '../../../graphql/generatedTypes';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import getEmailsFromNode from '../../helpers/getEmailsFromNode';
import getAddressesFromNode from '../../helpers/getAddressesFromNode';
import { updateMutationVariables } from '../../helpers/updateMutationVariables';
import getPhonesFromNode from '../../helpers/getPhonesFromNode';
import useToast from '../../../toast/useToast';

const UPDATE_PROFILE = loader('../../graphql/UpdateMyProfile.graphql');
const SERVICE_CONNECTIONS = loader(
  '../../graphql/ServiceConnectionsQuery.graphql'
);

type Props = {
  setEditing: () => void;
  profileData: MyProfileQuery;
};

function EditProfile(props: Props) {
  const { createToast } = useToast();
  const { data, refetch } = useQuery<ServiceConnectionsQuery>(
    SERVICE_CONNECTIONS,
    {
      onError: (error: Error) => {
        Sentry.captureException(error);
        createToast({ type: 'error' });
      },
    }
  );
  const { profileData } = props;
  const { t, i18n } = useTranslation();
  const [updateProfile, { loading }] = useMutation<
    UpdateMyProfileData,
    UpdateMyProfileVariables
  >(UPDATE_PROFILE, {
    refetchQueries: ['MyProfileQuery'],
  });

  useEffect(() => {
    const cb = () => refetch();
    i18n.on('languageChanged', cb);
    return () => {
      i18n.off('languageChanged', cb);
    };
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
        createToast({ type: 'error' });
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
          primaryAddress:
            profileData?.myProfile?.primaryAddress || ({} as PrimaryAddress),
          primaryPhone:
            profileData?.myProfile?.primaryPhone || ({} as PrimaryPhone),
          phones: getPhonesFromNode(profileData),
          addresses: getAddressesFromNode(profileData),
          emails: getEmailsFromNode(profileData),
        }}
        isSubmitting={loading}
        onValues={handleOnValues}
      />
    </ProfileSection>
  );
}

export default EditProfile;
