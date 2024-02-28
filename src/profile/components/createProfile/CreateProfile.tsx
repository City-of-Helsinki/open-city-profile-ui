import React from 'react';
import { User } from 'oidc-client';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client';
import * as Sentry from '@sentry/browser';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import classNames from 'classnames';

import CreateProfileForm, {
  FormValues,
} from '../createProfileForm/CreateProfileForm';
import styles from './CreateProfile.module.css';
import {
  CreateMyProfile as CreateMyProfileRoot,
  CreateMyProfileVariables,
} from '../../../graphql/generatedTypes';
import { EmailType, Language, PhoneType } from '../../../graphql/typings';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import useToast from '../../../toast/useToast';
import Explanation from '../../../common/explanation/Explanation';
import commonContentStyles from '../../../common/cssHelpers/content.module.css';
import CREATE_PROFILE from '../../graphql/CreateMyProfile.graphql';

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
            formValues.number
              ? {
                  phone: `${formValues.countryCallingCode}${formValues.number}`,
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
    <div
      className={classNames([
        commonContentStyles['common-content-area'],
        commonContentStyles['common-bottom-padding'],
        styles['content'],
      ])}
    >
      <Explanation
        heading={t('createProfile.heading')}
        text={t('createProfile.helpText')}
        dataTestId="create-profile-heading"
        useHeadingHeroStyle
      />
      <ProfileSection>
        <CreateProfileForm
          profile={{
            firstName: tunnistamoUser.profile.given_name || '',
            lastName: tunnistamoUser.profile.family_name || '',
            email: tunnistamoUser.profile.email || '',
            profileLanguage: Language.FINNISH,
            number: '',
            countryCallingCode: '',
          }}
          isSubmitting={loading}
          onValues={handleOnValues}
        />
      </ProfileSection>
    </div>
  );
}

export default CreateProfile;
