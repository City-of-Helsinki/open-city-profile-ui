import React from 'react';
import { User } from 'oidc-client';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client';
import { loader } from 'graphql.macro';
import * as Sentry from '@sentry/browser';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { Section } from 'hds-react';

import CreateProfileForm, {
  FormValues,
} from '../createProfileForm/CreateProfileForm';
import PageHeading from '../../../common/pageHeading/PageHeading';
import styles from './CreateProfile.module.css';
import responsive from '../../../common/cssHelpers/responsive.module.css';
import {
  CreateMyProfile as CreateMyProfileRoot,
  CreateMyProfileVariables,
} from '../../../graphql/generatedTypes';
import { EmailType, Language, PhoneType } from '../../../graphql/typings';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import useToast from '../../../toast/useToast';
import Explanation from '../../../common/explanation/Explanation';

const CREATE_PROFILE = loader('../../graphql/CreateMyProfile.graphql');

type Props = {
  tunnistamoUser: User;
  onProfileCreated: () => void;
};

function CreateProfile({
  tunnistamoUser,
  onProfileCreated,
}: Props): React.ReactElement {
  const { t } = useTranslation();
  const { trackEvent } = useMatomo();
  const [createProfile, { loading }] = useMutation<
    CreateMyProfileRoot,
    CreateMyProfileVariables
  >(CREATE_PROFILE);
  const { createToast } = useToast();

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
          trackEvent({ category: 'action', action: 'Register profile' });
          onProfileCreated();
        }
      })
      .catch((error: Error) => {
        Sentry.captureException(error);
        createToast({ type: 'error' });
      });
  };
  return (
    <div className={styles['create-profile']}>
      <Section korosType="basic">
        <PageHeading
          text={t('createProfile.pageTitle')}
          dataTestId="create-profile-heading"
        />
      </Section>
      <div className={styles['content-wrapper']}>
        <div className={responsive['max-width-centered']}>
          <Explanation
            main={t('createProfile.heading')}
            titleVariant="h2"
            small={t('createProfile.helpText')}
          />
          <ProfileSection>
            <CreateProfileForm
              profile={{
                firstName: tunnistamoUser.profile.given_name || '',
                lastName: tunnistamoUser.profile.family_name || '',
                email: tunnistamoUser.profile.email || '',
                profileLanguage: Language.FINNISH,
                phone: '',
              }}
              isSubmitting={loading}
              onValues={handleOnValues}
            />
          </ProfileSection>
        </div>
      </div>
    </div>
  );
}

export default CreateProfile;
