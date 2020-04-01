import React, { useState } from 'react';
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
  CreateMyProfile as CreateMyProfileData,
  CreateMyProfileVariables,
  EmailType,
  Language,
  PhoneType,
} from '../../../graphql/generatedTypes';
import NotificationComponent from '../../../common/notification/NotificationComponent';

const CREATE_PROFILE = loader('../../graphql/CreateMyProfile.graphql');

type Props = {
  tunnistamoUser: User;
  onProfileCreated: () => void;
};

function CreateProfile({ tunnistamoUser, onProfileCreated }: Props) {
  const { t } = useTranslation();
  const [showNotification, setShowNotification] = useState(false);
  const [createProfile, { loading }] = useMutation<
    CreateMyProfileData,
    CreateMyProfileVariables
  >(CREATE_PROFILE);
  const handleOnValues = (formValues: FormValues) => {
    const variables: CreateMyProfileVariables = {
      input: {
        profile: {
          firstName: formValues.firstName,
          lastName: formValues.lastName,
          language: formValues.profileLanguage,
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
      },
    };

    createProfile({ variables })
      .then(result => {
        if (result.data) {
          onProfileCreated();
        }
      })
      .catch(() => setShowNotification(true));
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
            firstName: tunnistamoUser.profile.given_name || '',
            lastName: tunnistamoUser.profile.family_name || '',
            email: tunnistamoUser.profile.email,
            profileLanguage: Language.FINNISH,
            phone: '',
          }}
          isSubmitting={loading}
          onValues={handleOnValues}
        />
      </div>
      <NotificationComponent
        show={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}

export default CreateProfile;
