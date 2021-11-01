import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { TextInput, Checkbox, Button, PhoneInput } from 'hds-react';
import { Formik, Form, Field, FormikProps } from 'formik';
import * as yup from 'yup';
import classNames from 'classnames';

import { getIsInvalid, getFieldError } from '../../helpers/formik';
import FormikDropdown from '../../../common/formikDropdown/FormikDropdown';
import styles from './CreateProfileForm.module.css';
import profileConstants from '../../constants/profileConstants';
import { Language } from '../../../graphql/typings';
import { getFormFields } from '../../helpers/formProperties';
import {
  basicDataSchema,
  createProfilePhoneSchema,
} from '../../../common/schemas/schemas';
import NewWindowLinkWithChildrenAsTitle from '../../../common/newWindowLink/NewWindowLinkWithChildrenAsTitle';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';

const termsSchema = yup
  .object()
  .shape({ terms: yup.boolean().oneOf([true], 'validation.required') });
const schema = basicDataSchema
  .concat(termsSchema)
  .concat(createProfilePhoneSchema);

export type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileLanguage: Language;
};

type FormikFormValues = FormValues & {
  terms: boolean;
};

type Props = {
  profile: FormValues;
  onValues: (values: FormValues) => void;
  isSubmitting: boolean;
};

function CreateProfileForm(props: Props): React.ReactElement {
  const { t } = useTranslation();
  const formFields = getFormFields('basic-data');
  const phoneFields = getFormFields('phones');
  const [submitAttempted, setSubmitAttempted] = useState<boolean>(false);

  const hasFieldError = (
    formikProps: FormikProps<FormikFormValues>,
    fieldName: keyof FormikFormValues
  ): boolean =>
    getIsInvalid<FormikFormValues>(formikProps, fieldName, submitAttempted);

  const getFieldErrorMessage = (
    formikProps: FormikProps<FormikFormValues>,
    fieldName: keyof FormikFormValues
  ) => {
    if (!hasFieldError(formikProps, fieldName)) {
      return undefined;
    }
    return getFieldError<FormikFormValues>(
      t,
      formikProps,
      fieldName,
      submitAttempted
    );
  };

  const profileLanguageOptions = profileConstants.LANGUAGES.map(language => ({
    value: language,
    label: t(`LANGUAGE_OPTIONS.${language}`),
  }));
  const formFieldStyle = classNames([
    styles['form-field'],
    commonFormStyles['form-field'],
  ]);
  const containerStyle = classNames([
    styles['form-fields'],
    commonFormStyles['multi-item-wrapper'],
  ]);
  return (
    <Formik
      initialValues={{
        ...props.profile,
        terms: false,
      }}
      initialErrors={{
        terms: 'validation.required',
      }}
      onSubmit={async values => {
        props.onValues({
          firstName: values.firstName,
          lastName: values.lastName,
          email: props.profile.email,
          phone: values.phone,
          profileLanguage: values.profileLanguage,
        });
      }}
      validationSchema={schema}
    >
      {formikProps => (
        <Form>
          <div className={containerStyle}>
            <Field
              className={formFieldStyle}
              name="firstName"
              id="firstName"
              maxLength={formFields.firstName.max as number}
              as={TextInput}
              invalid={hasFieldError(formikProps, 'firstName')}
              errorText={getFieldErrorMessage(formikProps, 'firstName')}
              label={t('profileForm.firstName')}
            />
            <Field
              className={formFieldStyle}
              name="lastName"
              id="lastName"
              maxLength={formFields.lastName.max as number}
              as={TextInput}
              invalid={hasFieldError(formikProps, 'lastName')}
              errorText={getFieldErrorMessage(formikProps, 'lastName')}
              label={t('profileForm.lastName')}
            />

            <FormikDropdown
              className={formFieldStyle}
              name={'profileLanguage'}
              options={profileLanguageOptions}
              default={formikProps.values.profileLanguage}
              label={t('profileForm.language')}
              onChange={option =>
                formikProps.setFieldValue('profileLanguage', option.value)
              }
            />

            <Field
              className={formFieldStyle}
              name="phone"
              id="phone"
              as={PhoneInput}
              minLength={phoneFields.value.min as number}
              maxLength={phoneFields.value.max as number}
              invalid={hasFieldError(formikProps, 'phone')}
              errorText={getFieldErrorMessage(formikProps, 'phone')}
              label={t('profileForm.phone')}
            />

            <div className={formFieldStyle}>
              <TextInput
                id={'create-profile-email'}
                readOnly
                label={t('profileForm.email')}
                defaultValue={props.profile.email}
              />
            </div>
          </div>

          <div className={styles['terms']}>
            <p>
              <Trans
                i18nKey="profileForm.terms"
                components={{
                  fileDescriptionLink: (
                    <NewWindowLinkWithChildrenAsTitle
                      link={t('profileForm.termsFileDescriptionLink')}
                    />
                  ),
                  dataProtectionLink: (
                    <NewWindowLinkWithChildrenAsTitle
                      link={t('profileForm.termsDataProtectionLink')}
                    />
                  ),
                }}
              />
            </p>
            <Field
              as={Checkbox}
              name="terms"
              id="terms"
              checked={formikProps.values.terms}
              label={t('profileForm.termsLabel')}
            />
          </div>
          <div>
            <Button
              variant="primary"
              type="submit"
              disabled={Boolean(
                formikProps.isSubmitting ||
                  formikProps.errors.terms ||
                  props.isSubmitting
              )}
              onClick={() => {
                if (!submitAttempted) {
                  setSubmitAttempted(true);
                }
              }}
            >
              {t('profileForm.submit')}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default CreateProfileForm;
