import React, { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, Button } from 'hds-react';
import {
  Formik,
  Form,
  Field,
  FormikProps,
  FieldArray,
  FieldArrayRenderProps,
  ArrayHelpers,
} from 'formik';
import * as yup from 'yup';
import countries from 'i18n-iso-countries';
import classNames from 'classnames';

import { ReactComponent as PlusIcon } from '../../../common/svg/PlusIcon.svg';
import getLanguageCode from '../../../common/helpers/getLanguageCode';
import { getIsInvalid, getError } from '../../helpers/formik';
import Select from '../../../common/select/Select';
import styles from './EditProfileForm.module.css';
import {
  EmailType,
  Language,
  ServiceConnectionsQuery,
  MyProfileQuery_myProfile_emails_edges_node as Email,
  MyProfileQuery_myProfile_primaryEmail as PrimaryEmail,
} from '../../../graphql/generatedTypes';
import profileConstants from '../../constants/profileConstants';
import ConfirmationModal from '../modals/confirmationModal/ConfirmationModal';

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
  emails: yup.array().of(
    yup.object().shape({
      email: yup.string().email('validation.email'),
    })
  ),
});

export type FormValues = {
  firstName: string;
  lastName: string;
  primaryEmail: PrimaryEmail;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  profileLanguage: Language;
  countryCode: string;
  emails: Email[];
};

type Props = {
  setEditing: () => void;
  isSubmitting: boolean;
  profile: FormValues;
  onValues: (values: FormValues) => void;
  services?: ServiceConnectionsQuery;
};

function EditProfileForm(props: Props) {
  const { t, i18n } = useTranslation();
  const [confirmationDialog, setConfirmationDialog] = useState<boolean>(false);
  const userHasServices =
    props.services?.myProfile?.serviceConnections?.edges?.length !== 0;

  const applicationLanguage = getLanguageCode(i18n.languages[0]);
  const countryList = countries.getNames(applicationLanguage);
  const countryOptions = Object.keys(countryList).map(key => {
    return {
      value: key,
      label: countryList[key],
    };
  });

  const getFieldError = (
    formikProps: FormikProps<FormValues>,
    fieldName: string,
    options: object
  ) => {
    const renderError = (message: string) => t(message, options);

    return getError<FormValues>(formikProps, fieldName, renderError);
  };

  const changePrimaryEmail = (
    formProps: FormikProps<FormValues>,
    arrayHelpers: ArrayHelpers,
    index: number
  ) => {
    const oldPrimary = { ...formProps.values.primaryEmail, primary: false };
    const newPrimary = { ...formProps.values.emails[index], primary: true };

    formProps.setFieldValue('primaryEmail', newPrimary);
    arrayHelpers.remove(index);
    arrayHelpers.push(oldPrimary);
  };

  return (
    <Formik
      initialValues={{
        ...props.profile,
      }}
      onSubmit={values => {
        props.onValues({
          ...values,
          emails: [...values.emails, values.primaryEmail],
        });
      }}
      validationSchema={schema}
    >
      {formikProps => (
        <React.Fragment>
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
                helperText={getFieldError(formikProps, 'lastName', {
                  max: 255,
                })}
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
                invalid={getIsInvalid(formikProps, 'phone')}
                helperText={getFieldError(formikProps, 'phone', {
                  min: 6,
                  max: 255,
                })}
                labelText={t('profileForm.phone')}
              />

              <div className={styles.formField}>
                <label className={styles.label}>{t('profileForm.email')}</label>
                <span className={styles.email}>
                  {formikProps.values.primaryEmail.email}
                </span>
              </div>
            </div>

            <div
              className={classNames(styles.formFields, styles.addressFields)}
            >
              <Field
                className={styles.formField}
                name="address"
                id="address"
                maxLength="255"
                as={TextInput}
                invalid={getIsInvalid(formikProps, 'address')}
                helperText={getFieldError(formikProps, 'address', {
                  max: 255,
                })}
                labelText={t('profileForm.address')}
              />

              <Field
                className={styles.formField}
                name="postalCode"
                id="postalCode"
                maxLength="5"
                as={TextInput}
                invalid={getIsInvalid(formikProps, 'postalCode')}
                helperText={getFieldError(formikProps, 'postalCode', {
                  max: 5,
                })}
                labelText={t('profileForm.postalCode')}
              />

              <Field
                className={styles.formField}
                name="city"
                id="city"
                maxLength="255"
                as={TextInput}
                invalid={getIsInvalid(formikProps, 'city')}
                helperText={getFieldError(formikProps, 'city', {
                  max: 255,
                })}
                labelText={t('profileForm.city')}
              />

              <Field
                id="countryCode"
                name="countryCode"
                className={styles.formField}
                as={Select}
                options={countryOptions}
                labelText={t('profileForm.country')}
              />
            </div>
            <div className={styles.linebreak} />
            <h2 className={styles.additionalInfo}>
              {t('profileForm.additionalInfo')}
            </h2>
            <FieldArray
              name="emails"
              render={(arrayHelpers: FieldArrayRenderProps) => (
                <React.Fragment>
                  <div className={styles.formFields}>
                    {formikProps?.values?.emails.map(
                      (email: Email | PrimaryEmail, index: number) => (
                        <div key={index} className={styles.formField}>
                          <Field
                            as={TextInput}
                            name={`emails.${index}.email`}
                            id={`emails.${index}.email`}
                            labelText={t('profileForm.email')}
                            readOnly={email.id}
                            invalid={getIsInvalid(
                              formikProps,
                              `emails[${index}].email`
                            )}
                            helperText={getFieldError(
                              formikProps,
                              `emails[${index}].email`,
                              {}
                            )}
                          />
                          <div className={styles.additionalActionsWrapper}>
                            <button
                              type="button"
                              className={styles.removeButton}
                              onClick={() => {
                                arrayHelpers.remove(index);
                              }}
                            >
                              {t('profileForm.delete')}
                            </button>
                            {email.id && (
                              <Fragment>
                                {' | '}
                                <button
                                  type="button"
                                  className={styles.removeButton}
                                  onClick={() =>
                                    changePrimaryEmail(
                                      formikProps,
                                      arrayHelpers,
                                      index
                                    )
                                  }
                                >
                                  Make primary
                                </button>
                              </Fragment>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <br />
                  <Button
                    iconLeft={<PlusIcon className={styles.plusIcon} />}
                    variant="supplementary"
                    type="button"
                    onClick={() =>
                      arrayHelpers.push({
                        email: '',
                        emailType: EmailType.OTHER,
                        primary: false,
                      })
                    }
                  >
                    {t('profileForm.addAnotherEmail')}
                  </Button>
                </React.Fragment>
              )}
            />

            <div className={styles.buttonRow}>
              <Button
                className={styles.button}
                disabled={Boolean(
                  formikProps.isSubmitting || props.isSubmitting
                )}
                onClick={() => {
                  userHasServices &&
                  Object.keys(formikProps.errors)?.length === 0
                    ? setConfirmationDialog(true)
                    : formikProps.handleSubmit();
                }}
              >
                {t('profileForm.submit')}
              </Button>
              <Button
                variant="secondary"
                className={styles.button}
                onClick={props.setEditing}
              >
                {t('profileForm.cancel')}
              </Button>
            </div>
          </Form>

          <ConfirmationModal
            services={props.services}
            isOpen={confirmationDialog}
            onClose={() => setConfirmationDialog(false)}
            onConfirm={formikProps.handleSubmit}
            modalTitle={t('confirmationModal.saveTitle')}
            modalText={t('confirmationModal.saveMessage')}
            actionButtonText={t('confirmationModal.save')}
          />
        </React.Fragment>
      )}
    </Formik>
  );
}

export default EditProfileForm;
