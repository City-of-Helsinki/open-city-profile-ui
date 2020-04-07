import React from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from 'hds-react';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';

import Select from '../../../common/select/Select';
import Button from '../../../common/button/Button';
import styles from './EditProfileForm.module.css';
import { Language } from '../../../graphql/generatedTypes';
import profileConstants from '../../constants/profileConstants';

const schema = yup.object().shape({
  firstName: yup.string().max(255, 'validation.maxLength'),
  lastName: yup.string().max(255, 'validation.maxLength'),
  language: yup.string(),
  phone: yup
    .string()
    .min(6, 'validation.phoneMin')
    .max(255, 'validation.maxLength'),
  address: yup.string().max(128, 'validation.maxLength'),
  city: yup.string().max(64, 'validation.maxLength'),
  postalCode: yup.string().max(5, 'validation.maxLength'),
});

export type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  profileLanguage: Language;
};

type Props = {
  setEditing: () => void;
  isSubmitting: boolean;
  profile: FormValues;
  onValues: (values: FormValues) => void;
  userHasServices: boolean;
};

function EditProfileForm(props: Props) {
  const { t } = useTranslation();

  return (
    <Formik
      initialValues={{
        ...props.profile,
      }}
      onSubmit={values => {
        props.onValues({
          firstName: values.firstName,
          lastName: values.lastName,
          email: props.profile.email,
          phone: values.phone,
          address: values.address,
          city: values.city,
          postalCode: values.postalCode,
          profileLanguage: values.profileLanguage,
        });
      }}
      validationSchema={schema}
    >
      {({ errors, isSubmitting, submitCount }) => (
        <Form>
          <div className={styles.formFields}>
            <Field
              className={styles.formField}
              name="firstName"
              id="firstName"
              maxLength="255"
              as={TextInput}
              invalid={submitCount && errors.firstName}
              invalidText={
                submitCount &&
                errors.firstName &&
                t(errors.firstName, { max: 255 })
              }
              labelText={t('profileForm.firstName')}
            />

            <Field
              className={styles.formField}
              name="lastName"
              id="lastName"
              maxLength="255"
              as={TextInput}
              invalid={submitCount && errors.lastName}
              invalidText={
                submitCount &&
                errors.lastName &&
                t(errors.lastName, { max: 255 })
              }
              labelText={t('profileForm.lastName')}
            />

            <Field
              id="profileLanguage"
              name="profileLanguage"
              className={styles.formField}
              as={Select}
              options={profileConstants.LANGUAGES.map(language => {
                return {
                  value: language,
                  label: t(`LANGUAGE_OPTIONS.${language}`),
                };
              })}
              labelText={t('profileForm.language')}
            />

            <Field
              className={styles.formField}
              name="phone"
              id="phone"
              as={TextInput}
              type="tel"
              minLength="6"
              maxLength="255"
              invalid={submitCount && errors.phone}
              invalidText={
                submitCount &&
                errors.phone &&
                t(errors.phone, { min: 6, max: 255 })
              }
              labelText={t('profileForm.phone')}
            />

            <div className={styles.formField}>
              <label className={styles.label}>{t('profileForm.email')}</label>
              <span className={styles.email}>{props.profile.email}</span>
            </div>
          </div>

          <div className={styles.linebreak} />

          <div className={styles.formFields}>
            <Field
              className={styles.formField}
              name="address"
              id="address"
              maxLength="255"
              as={TextInput}
              invalid={submitCount && errors.address}
              invalidText={
                submitCount && errors.address && t(errors.address, { max: 255 })
              }
              labelText={t('profileForm.address')}
            />

            <Field
              className={styles.formField}
              name="postalCode"
              id="postalCode"
              maxLength="5"
              as={TextInput}
              invalid={submitCount && errors.postalCode}
              invalidText={
                submitCount &&
                errors.postalCode &&
                t(errors.postalCode, { max: 5 })
              }
              labelText={t('profileForm.postalCode')}
            />

            <Field
              className={styles.formField}
              name="city"
              id="city"
              maxLength="255"
              as={TextInput}
              invalid={submitCount && errors.city}
              invalidText={
                submitCount && errors.city && t(errors.city, { max: 255 })
              }
              labelText={t('profileForm.city')}
            />
            <br />
          </div>
          <Button
            type="submit"
            disabled={
              props.userHasServices
                ? false
                : Boolean(isSubmitting || props.isSubmitting)
            }
          >
            {t('profileForm.submit')}
          </Button>
          <Button
            type="button"
            variant="outlined"
            className={styles.button}
            onClick={props.setEditing}
          >
            {t('profileForm.cancel')}
          </Button>
        </Form>
      )}
    </Formik>
  );
}

export default EditProfileForm;
