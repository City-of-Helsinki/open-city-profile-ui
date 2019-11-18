import React, { useEffect, useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { useTranslation } from 'react-i18next';

import CREATE_PROFILE from './createProfileMutation';
import CreateProfileForm from './CreateProfileForm';
import getAuthenticatedUser from '../auth/getAuthenticatedUser';
import PageHeading from '../common/pageHeading/PageHeading';

function CreateProfile() {
  const { t } = useTranslation();
  const [createProfile, { loading, data }] = useMutation(CREATE_PROFILE);
  const [tunnistamoUser, setTunnistamoUser] = useState();
  useEffect(() => {
    getAuthenticatedUser().then(user => setTunnistamoUser(user));
  }, []);
  return (
    <>
      <PageHeading text={t('profile.createHeading')} />
      {tunnistamoUser && (
        <CreateProfileForm
          profile={{
            firstName: tunnistamoUser.profile.given_name,
            lastName: tunnistamoUser.profile.family_name,
            email: tunnistamoUser.profile.email,
            phone: '',
          }}
          onReady={(values: {}) => createProfile({ variables: values })}
        />
      )}
      {loading || (!tunnistamoUser && <p>Loading</p>)}
    </>
  );
}

export default CreateProfile;
