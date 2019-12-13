import React from 'react';
import { User } from 'oidc-client';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/react-hooks';
import { loader } from 'graphql.macro';
import classNames from 'classnames';

import CreateProfileForm, {
  FormValues,
} from '../createProfileForm/CreateProfileForm';
import PageHeading from '../../../common/pageHeading/PageHeading';
import Explanation from '../../../common/explanation/Explanation';
import styles from './CreateProfile.module.css';
import responsive from '../../../common/cssHelpers/responsive.module.css';
import {
  CreateProfile as CreateProfileData,
  CreateProfileVariables,
} from '../../graphql/__generated__/CreateProfile';
import {
  EmailType,
  PhoneType,
} from '../../../graphql/__generated__/globalTypes';

const CREATE_PROFILE = loader('../../graphql/CreateProfile.graphql');

type Props = {
  tunnistamoUser: User;
  onProfileCreated: () => void;
};

function CreateProfile({ tunnistamoUser, onProfileCreated }: Props) {
  const { t } = useTranslation();
  const [createProfile, { loading }] = useMutation<
    CreateProfileData,
    CreateProfileVariables
  >(CREATE_PROFILE);
  const handleOnValues = (formValues: FormValues) => {
    const variables: CreateProfileVariables = {
      profile: {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        addEmails: [
          {
            email: formValues.email,
            primary: true,
            emailType: EmailType.OTHER,
          },
        ],
        addPhones: [
          formValues.phone
            ? {
                phone: formValues.phone,
                primary: true,
                phoneType: PhoneType.OTHER,
              }
            : null,
        ],
      },
    };
    createProfile({ variables }).then(result => {
      if (result.data) {
        onProfileCreated();
      }
    });
  };
  return (
    <div className={styles.createProfile}>
      <PageHeading
        text={t('createProfile.pageTitle')}
        className={responsive.maxWidthCentered}
      />
      <div className={classNames(styles.front, responsive.maxWidthCentered)}>
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
