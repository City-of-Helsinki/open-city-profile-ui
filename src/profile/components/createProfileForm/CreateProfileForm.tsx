import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { TextInput, Checkbox } from 'hds-react';
import { Formik, Form, Field, FormikProps } from 'formik';
import * as yup from 'yup';

import { getIsInvalid, getFieldError } from '../../helpers/formik';
import FormikDropdown from '../../../common/formikDropdown/FormikDropdown';
import Button from '../../../common/button/Button';
import styles from './CreateProfileForm.module.css';
import profileConstants from '../../constants/profileConstants';
import { Language } from '../../../graphql/typings';
import { getFormFields } from '../../helpers/formProperties';
import {
  basicDataSchema,
  createProfilePhoneSchema,
} from '../../../common/schemas/schemas';

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
          <div className={styles.formFields}>
            <Field
              className={styles.formField}
              name="firstName"
              id="firstName"
              maxLength={formFields.firstName.max as number}
              as={TextInput}
              invalid={hasFieldError(formikProps, 'firstName')}
              errorText={getFieldErrorMessage(formikProps, 'firstName')}
              label={t('profileForm.firstName')}
            />
            <Field
              className={styles.formField}
              name="lastName"
              id="lastName"
              maxLength={formFields.lastName.max as number}
              as={TextInput}
              invalid={hasFieldError(formikProps, 'lastName')}
              errorText={getFieldErrorMessage(formikProps, 'lastName')}
              label={t('profileForm.lastName')}
            />

            <FormikDropdown
              className={styles.formField}
              name={'profileLanguage'}
              options={profileLanguageOptions}
              default={formikProps.values.profileLanguage}
              label={t('profileForm.language')}
              onChange={option =>
                formikProps.setFieldValue('profileLanguage', option.value)
              }
            />

            <Field
              className={styles.formField}
              name="phone"
              id="phone"
              as={TextInput}
              type="tel"
              minLength={phoneFields.value.min as number}
              maxLength={phoneFields.value.max as number}
              invalid={hasFieldError(formikProps, 'phone')}
              errorText={getFieldErrorMessage(formikProps, 'phone')}
              label={t('profileForm.phone')}
            />

            <div className={styles.formField}>
              <label className={styles.label}>{t('profileForm.email')}</label>
              <span className={styles.email}>{props.profile.email}</span>
            </div>
          </div>

          <div className={styles.terms}>
            <Field
              as={Checkbox}
              name="terms"
              id="terms"
              checked={formikProps.values.terms}
              label={
                <Trans
                  i18nKey="profileForm.terms"
                  components={[
                    // eslint-disable-next-line jsx-a11y/anchor-has-content
                    <a
                      href={t('profileForm.termsFileDescriptionLink')}
                      target="_blank"
                      rel="noopener noreferrer"
                    />,
                    // eslint-disable-next-line jsx-a11y/anchor-has-content
                    <a
                      href={t('profileForm.termsDataProtectionLink')}
                      target="_blank"
                      rel="noopener noreferrer"
                    />,
                  ]}
                />
              }
            />
          </div>
          <div>
            <Button
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
