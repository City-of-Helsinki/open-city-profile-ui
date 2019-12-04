import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { TextInput } from 'hds-react';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';

import Button from '../../../common/button/Button';
import styles from './CreateProfileForm.module.css';

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
};

type Props = {
  profile: FormValues;
  onValues: (values: FormValues) => void;
  isSubmitting: boolean;
};

function CreateProfileForm(props: Props) {
  const { t } = useTranslation();
  return (
    <Formik
      initialValues={{
        ...props.profile,
        terms: false,
      }}
      initialErrors={{
        terms: 'validation.required',
      }}
      onSubmit={values => {
        props.onValues({
          firstName: values.firstName,
          lastName: values.lastName,
          email: props.profile.email,
          phone: values.phone,
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
              maxlength="255"
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
              maxlength="255"
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
              minlength="6"
              maxlength="255"
              invalid={submitCount && errors.phone}
              invalidText={
                submitCount &&
                errors.phone &&
                t(errors.phone, { min: 6, max: 255 })
              }
              labelText={t('profileForm.phone')}
            />
          </div>
          <label className={styles.terms}>
            <Field name="terms" type="checkbox" />{' '}
            <Trans
              i18nKey="profileForm.terms"
              // eslint-disable-next-line jsx-a11y/anchor-has-content
              components={[<a href="/tos"></a>]}
            />
          </label>
          <div>
            <Button
              type="submit"
              disabled={Boolean(
                isSubmitting || errors.terms || props.isSubmitting
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
