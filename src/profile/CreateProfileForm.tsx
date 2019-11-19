import React from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from 'hds-react';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';

const schema = yup.object().shape({
  firstName: yup.string(),
  lastName: yup.string(),
  email: yup.string().email('validation.email'),
  terms: yup.boolean().oneOf([true], 'validation.required'),
});

type Props = {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  onReady: (values: {}) => void;
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
        props.onReady({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.lastName,
          phone: values.lastName,
        });
      }}
      validationSchema={schema}
    >
      {({ errors }) => (
        <Form>
          <Field
            name="firstName"
            id="firstName"
            as={TextInput}
            invalid={errors.firstName}
            invalidText={errors.firstName && t(errors.firstName)}
            labelText={t('profileForm.firstName')}
          />
          <Field
            name="lastName"
            id="lastName"
            as={TextInput}
            invalid={errors.lastName}
            invalidText={errors.lastName && t(errors.lastName)}
            labelText={t('profileForm.lastName')}
          />
          <Field
            name="email"
            id="email"
            as={TextInput}
            invalid={errors.email}
            invalidText={errors.email && t(errors.email)}
            labelText={t('profileForm.email')}
          />
          <Field
            name="phone"
            id="phone"
            as={TextInput}
            invalid={errors.phone}
            invalidText={errors.phone && t(errors.phone)}
            labelText={t('profileForm.phone')}
          />
          <label>
            <Field name="terms" type="checkbox" /> {t('profileForm.terms')}
          </label>
          <div>
            <button type="submit" disabled={Object.keys(errors).length > 0}>
              {t('profileForm.submit')}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default CreateProfileForm;
