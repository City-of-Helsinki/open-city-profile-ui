import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { TextInput } from 'hds-react';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';

import Button from '../../../common/button/Button';
import styles from './EditProfileForm.module.css';

const schema = yup.object().shape({
  firstName: yup.string().max(255, 'validation.maxLength'),
  lastName: yup.string().max(255, 'validation.maxLength'),
  phone: yup.string()
    .min(6, 'validation.phoneMin')
    .max(255, 'validation.maxLength'),
  address: yup.string().max(255, 'validation.maxLength'),
  city: yup.string().max(255, 'validation.maxLength'),
  postalCode: yup.string().max(5, 'validation.maxLength')
});

export  type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
}

type Props = {
  profile: FormValues;
  onValues: (values: FormValues) => void;
}

function EditProfileForm(props: Props) {
  const { t } = useTranslation();

  return (
    <Formik
      initialValues={{
        ...props.profile
      }}
      onSubmit={values => {
        props.onValues({
          firstName: values.firstName,
          lastName: values.lastName,
          email: props.profile.email,
          phone: values.phone,
          address: values.address,
          city: values.city,
          postalCode: values.postalCode
        })
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
                t(errors.firstName, {max: 255 })
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

            <div className={styles.formField}>
              <label className={styles.label}>{t('profileForm.email')}</label>
              <span className={styles.email}>{props.profile.email}</span>
            </div>

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
                t(errors.phone, {min: 6, max: 255 })
              }
              labelText={t('profileForm.phone')}
            />

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
                submitCount &&
                errors.address &&
                t(errors.address, { max: 255})
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
                submitCount &&
                errors.city &&
                t(errors.city, { max: 255 })
              }
              labelText={t('profileForm.city')}
            />
            <br/>

          </div>
          <Button
            type="submit"
          >
            {t('profileForm.submit')}
          </Button>
        </Form>
      )}
    </Formik>
  )
}

export default EditProfileForm;
