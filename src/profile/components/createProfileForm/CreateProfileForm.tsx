import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { TextInput, Checkbox } from 'hds-react';
import { Formik, Form, Field, FormikProps } from 'formik';
import * as yup from 'yup';

import { getIsInvalid, getError } from '../../helpers/formik';
import FormikDropdown, {
  HdsOptionType,
} from '../../../common/formikDropdown/FormikDropdown';
import Button from '../../../common/button/Button';
import styles from './CreateProfileForm.module.css';
import profileConstants from '../../constants/profileConstants';
import { Language } from '../../../graphql/generatedTypes';

const schema = yup.object().shape({
  firstName: yup.string().max(255, 'validation.maxLength'),
  lastName: yup.string().max(255, 'validation.maxLength'),
  phone: yup
    .string()
    .min(6, 'validation.phoneMin')
    .max(255, 'validation.maxLength'),
  terms: yup.boolean().oneOf([true], 'validation.required'),
});

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

function CreateProfileForm(props: Props) {
  const { t } = useTranslation();

  const getFieldError = (
    formikProps: FormikProps<FormikFormValues>,
    fieldName: keyof FormikFormValues,
    options: object
  ) => {
    const renderError = (message: string) => t(message, options);

    return getError<FormikFormValues>(formikProps, fieldName, renderError);
  };

  const profileLanguageOptions = profileConstants.LANGUAGES.map(language => {
    return {
      value: language,
      label: t(`LANGUAGE_OPTIONS.${language}`),
    };
  });

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
              maxLength="255"
              as={TextInput}
              invalid={getIsInvalid(formikProps, 'firstName')}
              helperText={getFieldError(formikProps, 'firstName', {
                max: 255,
              })}
              labelText={t('profileForm.firstName')}
            />
            <Field
              className={styles.formField}
              name="lastName"
              id="lastName"
              maxLength="255"
              as={TextInput}
              invalid={getIsInvalid(formikProps, 'lastName')}
              helperText={getFieldError(formikProps, 'lastName', { max: 255 })}
              labelText={t('profileForm.lastName')}
            />

            <FormikDropdown
              className={styles.formField}
              name={'profileLanguage'}
              options={profileLanguageOptions}
              default={formikProps.values.profileLanguage}
              label={t('profileForm.language')}
              onChange={(option: HdsOptionType) =>
                formikProps.setFieldValue('profileLanguage', option.value)
              }
            />

            <Field
              className={styles.formField}
              name="phone"
              id="phone"
              as={TextInput}
              type="tel"
              minLength="6"
              maxLength="255"
              invalid={getIsInvalid(formikProps, 'phone')}
              helperText={getFieldError(formikProps, 'phone', {
                min: 6,
                max: 255,
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
