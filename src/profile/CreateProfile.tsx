import React from 'react';
import { User } from 'oidc-client';
import { useTranslation } from 'react-i18next';

import CreateProfileForm from './CreateProfileForm';
import PageHeading from '../common/pageHeading/PageHeading';

type Props = {
  tunnistamoUser: User;
};

function CreateProfile({ tunnistamoUser }: Props) {
  const { t } = useTranslation();
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
          onReady={(profile: {}) => {}}
        />
      )}
    </>
  );
}

export default CreateProfile;
