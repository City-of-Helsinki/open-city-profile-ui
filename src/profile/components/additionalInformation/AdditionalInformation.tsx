import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikProps } from 'formik';
import to from 'await-to-js';
import classNames from 'classnames';
import { Option } from 'hds-react';

import profileConstants from '../../constants/profileConstants';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import FormikDropdown from '../../../common/formikDropdown/FormikDropdown';
import { useProfileDataEditor } from '../../hooks/useProfileDataEditor';
import {
  additionalInformationType,
  AdditionalInformationValue,
} from '../../helpers/editData';
import useNotificationContent from '../editingNotifications/useNotificationContent';
import EditingNotifications from '../editingNotifications/EditingNotifications';

type FormValues = {
  language: AdditionalInformationValue['language'];
};

function AdditionalInformation(): React.ReactElement | null {
  const { editDataList, save, reset } = useProfileDataEditor({
    dataType: additionalInformationType,
  });
  const {
    content,
    setErrorMessage,
    setSuccessMessage,
    clearMessage,
  } = useNotificationContent();
  const { t } = useTranslation();
  if (!editDataList || !editDataList[0]) {
    return null;
  }
  const editData = editDataList[0];
  const { value, saving } = editData;
  const { language } = value as AdditionalInformationValue;
  const languageOptions: Option[] = profileConstants.LANGUAGES.map(
    languageOption => ({
      value: languageOption,
      label: t(`LANGUAGE_OPTIONS.${languageOption}`),
    })
  ) as Option[];
  const currentOption = languageOptions.find(
    option => option.value === language
  );
  const defaultOption = languageOptions[0];

  const updateLanguage = async (newLanguage: FormValues['language']) => {
    clearMessage();
    const [error] = await to(
      save(editData, { language: newLanguage } as AdditionalInformationValue)
    );
    if (error) {
      reset(editData);
      setErrorMessage('save');
    } else {
      setSuccessMessage('save');
    }
  };

  return (
    <ProfileSection>
      <div className={commonFormStyles['flex-box-columns']}>
        <div className={commonFormStyles['editor-description-container']}>
          <h2>{t('profileForm.language')}</h2>
          <p>{t('profileForm.languageDescription')}</p>
        </div>
        <div
          className={classNames(
            commonFormStyles['editor-form-fields'],
            commonFormStyles['last-item']
          )}
        >
          <Formik
            initialValues={{ language }}
            onSubmit={() => {
              /* onChange does this. This comment is here because onSubmit is mandatory and function cannot be empty */
            }}
          >
            {(formikProps: FormikProps<FormValues>) => (
              <Form>
                <FormikDropdown
                  className={classNames(
                    commonFormStyles['hidden-labels'],
                    commonFormStyles['responsive-button']
                  )}
                  id={`${additionalInformationType}-language`}
                  name={'language'}
                  label={t('profileForm.language')}
                  options={languageOptions}
                  defaultOption={defaultOption}
                  currentOption={currentOption}
                  disabled={!!saving}
                  onChange={(option: Option) => {
                    const languageValue = option.value as FormValues['language'];
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
      </div>
    </ProfileSection>
  );
}

export default AdditionalInformation;
