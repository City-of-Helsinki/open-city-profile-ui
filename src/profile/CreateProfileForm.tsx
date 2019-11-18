import React from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from 'hds-react';
import { Formik, Form, Field } from 'formik';

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
      onSubmit={values => {
        props.onReady({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.lastName,
          phone: values.lastName,
        });
      }}
    >
      {props => (
        <Form>
          <Field
            name="firstName"
            id="firstName"
            as={TextInput}
            labelText={t('profileForm.firstName')}
          />
          <Field
            name="lastName"
            id="lastName"
            as={TextInput}
            labelText={t('profileForm.lastName')}
          />
          <Field
            name="email"
            id="email"
            as={TextInput}
            labelText={t('profileForm.email')}
          />
          <Field
            name="phone"
            id="phone"
            as={TextInput}
            labelText={t('profileForm.phone')}
          />
          <label>
            <Field name="terms" type="checkbox" /> {t('profileForm.terms')}
          </label>
          <div>
            <button type="submit">{t('profileForm.submit')}</button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default CreateProfileForm;
