import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { Form, Formik, FormikProps } from 'formik';

import to from '../../../common/awaitTo';
import profileConstants from '../../constants/profileConstants';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import FormikDropdown, {
  OptionType,
  HdsOptionType,
} from '../../../common/formikDropdown/FormikDropdown';
import { useProfileMutationHandler } from '../../helpers/hooks';
import {
  additionalInformationType,
  EditableAdditionalInformation as EditableAdditionalInformationType,
} from '../../helpers/mutationEditor';
import useNotificationContent from '../editingNotifications/useNotificationContent';
import EditingNotifications from '../editingNotifications/EditingNotifications';

type FormValues = {
  profileLanguage: EditableAdditionalInformationType['profileLanguage'];
};

function EditableAdditionalInformation(): React.ReactElement | null {
  const { data, save } = useProfileMutationHandler({
    dataType: additionalInformationType,
  });
  const {
    content,
    setErrorMessage,
    setSuccessMessage,
    clearMessage,
  } = useNotificationContent();
  const { t } = useTranslation();
  const { trackEvent } = useMatomo();
  if (!data || !data[0]) {
    return null;
  }
  const editData = data[0];
  const { value } = editData;
  const { profileLanguage } = value as EditableAdditionalInformationType;
  const profileLanguageOptions: OptionType[] = profileConstants.LANGUAGES.map(
    languageOption => ({
      value: languageOption,
      label: t(`LANGUAGE_OPTIONS.${languageOption}`),
    })
  );

  const updateLanguage = async (
    languageValue: FormValues['profileLanguage']
  ) => {
    (editData.value as EditableAdditionalInformationType).profileLanguage = languageValue;
    clearMessage();
    trackEvent({
      category: 'form-action',
      action: `new-profile-language-${languageValue}`,
    });
    const [error] = await to(save(editData));
    if (error) {
      setErrorMessage('', 'save');
    } else {
      setSuccessMessage('', 'save');
    }
  };

  return (
    <ProfileSection>
      <h3 className={commonFormStyles.sectionTitle}>
        {t('profileForm.language')}
      </h3>
      <div className={commonFormStyles.multiItemWrapper}>
        <Formik
          initialValues={{ profileLanguage }}
          onSubmit={() => {
            /* onChange does this. This comment is here because onSubmit is mandatory and function cannot be empty */
          }}
        >
          {(formikProps: FormikProps<FormValues>) => (
            <Form>
              <FormikDropdown
                className={commonFormStyles.formField}
                name={'profileLanguage'}
                options={profileLanguageOptions}
                default={formikProps.values.profileLanguage || ''}
                label={''}
                onChange={option => {
                  const languageValue = (option as HdsOptionType)
                    .value as FormValues['profileLanguage'];
                  formikProps.setFieldValue('language', languageValue);
                  updateLanguage(languageValue);
                }}
              />
            </Form>
          )}
        </Formik>
      </div>
      <EditingNotifications
        content={content}
        dataType={additionalInformationType}
      />
    </ProfileSection>
  );
}

export default EditableAdditionalInformation;
