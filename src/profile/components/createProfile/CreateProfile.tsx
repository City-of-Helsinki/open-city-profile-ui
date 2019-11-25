import React from 'react';
import { User } from 'oidc-client';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/react-hooks';
import { loader } from 'graphql.macro';

import CreateProfileForm, {
  FormValues,
} from '../createProfileForm/CreateProfileForm';
import PageHeading from '../../../common/pageHeading/PageHeading';
import Explanation from '../../../common/explanation/Explanation';
import styles from './CreateProfile.module.css';

const CREATE_PROFILE = loader('../../graphql/createProfileMutation.graphql');

type Props = {
  tunnistamoUser: User;
  onProfileCreated: () => void;
};

function CreateProfile({ tunnistamoUser, onProfileCreated }: Props) {
  const { t } = useTranslation();
  const [createProfile, { loading }] = useMutation(CREATE_PROFILE);
  const handleOnValues = (profileData: FormValues) => {
    createProfile({ variables: { profile: profileData } }).then(result => {
      if (result.data) {
        onProfileCreated();
      }
    });
  };
  return (
    <div className={styles.createProfile}>
      <PageHeading text={t('createProfile.pageTitle')} />
      <div className={styles.front}>
        <Explanation
          main={t('createProfile.heading')}
          small={t('createProfile.helpText')}
        />
        <CreateProfileForm
          profile={{
            firstName: tunnistamoUser.profile.given_name,
            lastName: tunnistamoUser.profile.family_name,
            email: tunnistamoUser.profile.email,
            phone: '',
          }}
          isSubmitting={loading}
          onValues={handleOnValues}
        />
      </div>
    </div>
  );
}

export default CreateProfile;
