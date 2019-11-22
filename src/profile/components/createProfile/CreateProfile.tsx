import React from 'react';
import { User } from 'oidc-client';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/react-hooks';

import CreateProfileForm from '../createProfileForm/CreateProfileForm';
import PageHeading from '../../../common/pageHeading/PageHeading';
import CREATE_PROFILE from '../../graphql/createProfileMutation';

type Props = {
  tunnistamoUser: User;
  onProfileCreated: () => void;
};

function CreateProfile({ tunnistamoUser }: Props) {
  const { t } = useTranslation();
  const [createProfile, { data, loading }] = useMutation(CREATE_PROFILE);
  const handleSubmit = (profileData: {}) => {
    createProfile({ variables: { profile: profileData } });
  };
  return (
    <>
      <PageHeading text={t('profile.createHeading')} />
      <CreateProfileForm
        profile={{
          firstName: tunnistamoUser.profile.given_name,
          lastName: tunnistamoUser.profile.family_name,
          email: tunnistamoUser.profile.email,
          phone: '',
        }}
        onSubmit={handleSubmit}
      />
    </>
  );
}

export default CreateProfile;
