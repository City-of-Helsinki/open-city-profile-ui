import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { TextInput, Checkbox } from 'hds-react';
import { Formik, Form, Field, FormikProps } from 'formik';
import * as yup from 'yup';
import classNames from 'classnames';

import { getIsInvalid, getError, ErrorRenderer } from '../../helpers/formik';
import FormikDropdown, {
  HdsOptionType,
} from '../../../common/formikDropdown/FormikDropdown';
import Button from '../../../common/button/Button';
import styles from './CreateProfileForm.module.css';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import profileConstants from '../../constants/profileConstants';
import { getFormFields } from '../../helpers/formProperties';
import {
  basicDataSchema,
  createProfilePhoneSchema,
} from '../../../common/schemas/schemas';
import { FormValues } from '../../helpers/mutationEditor';

const termsSchema = yup
  .object()
  .shape({ terms: yup.boolean().oneOf([true], 'validation.required') });
const schema = basicDataSchema
  .concat(termsSchema)
  .concat(createProfilePhoneSchema);

export type CreateProfileFormValues = Pick<
  FormValues,
  'firstName' | 'lastName' | 'profileLanguage'
> & {
  email: string;
  phone: string;
};

type FormikFormValues = CreateProfileFormValues & {
  terms: boolean;
};

type Props = {
  profile: CreateProfileFormValues;
  onValues: (values: CreateProfileFormValues) => void;
  isSubmitting: boolean;
};

function CreateProfileForm(props: Props): React.ReactElement {
  const { t } = useTranslation();
  const formFields = getFormFields('basic-data');
  const phoneFields = getFormFields('phones');
  const getFieldError = (
    formikProps: FormikProps<FormikFormValues>,
    fieldName: keyof FormikFormValues,
    options: Record<string, unknown>
  ) => {
    const renderError: ErrorRenderer = errorProps =>
      t(errorProps.message, options);

    return getError<FormikFormValues>(
      formikProps,
      fieldName,
      renderError,
      true
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
          <div
            className={classNames([
              styles.formFields,
              commonFormStyles.multiItemWrapper,
            ])}
          >
            <Field
              className={classNames([
                styles.formField,
                commonFormStyles.formField,
              ])}
              name="firstName"
              id="firstName"
              maxLength={formFields.firstName.max as number}
              as={TextInput}
              invalid={getIsInvalid(formikProps, 'firstName', true)}
              helperText={getFieldError(formikProps, 'firstName', {
                max: formFields.firstName.max as number,
              })}
              labelText={t('profileForm.firstName')}
            />
            <Field
              className={styles.formField}
              name="lastName"
              id="lastName"
              maxLength={formFields.lastName.max as number}
              as={TextInput}
              invalid={getIsInvalid(formikProps, 'lastName', true)}
              helperText={getFieldError(formikProps, 'lastName', {
                max: formFields.lastName.max as number,
              })}
              labelText={t('profileForm.lastName')}
            />

            <FormikDropdown
              className={styles.formField}
              name={'profileLanguage'}
              options={profileLanguageOptions}
              default={formikProps.values.profileLanguage}
              label={t('profileForm.language')}
              onChange={option =>
                formikProps.setFieldValue(
                  'profileLanguage',
                  (option as HdsOptionType).value
                )
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
              invalid={getIsInvalid(formikProps, 'phone', true)}
              helperText={getFieldError(formikProps, 'phone', {
                min: phoneFields.value.min as number,
                max: phoneFields.value.max as number,
              })}
              labelText={t('profileForm.phone')}
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
              labelText={
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
