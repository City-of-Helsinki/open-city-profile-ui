import React, { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, IconPlusCircle, TextInput } from 'hds-react';
import {
  Field,
  FieldArray,
  FieldArrayRenderProps,
  Form,
  Formik,
  FormikProps,
} from 'formik';
import * as yup from 'yup';
import countries from 'i18n-iso-countries';
import classNames from 'classnames';
import validator from 'validator';

import { formConstants } from '../../constants/formConstants';
import getLanguageCode from '../../../common/helpers/getLanguageCode';
import { getError, getIsInvalid } from '../../helpers/formik';
import Select from '../../../common/select/Select';
import styles from './EditProfileForm.module.css';
import {
  Language,
  MyProfileQuery_myProfile_addresses_edges_node as Address,
  MyProfileQuery_myProfile_emails_edges_node as Email,
  MyProfileQuery_myProfile_primaryAddress as PrimaryAddress,
  MyProfileQuery_myProfile_primaryEmail as PrimaryEmail,
  ServiceConnectionsQuery,
} from '../../../graphql/generatedTypes';
import profileConstants from '../../constants/profileConstants';
import ConfirmationModal from '../modals/confirmationModal/ConfirmationModal';
import AdditionalInformationActions from './AdditionalInformationActions';

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
      email: yup.mixed().test('isValidEmail', 'validation.email', function() {
        return this.parent?.email
          ? validator.isEmail(this.parent?.email)
          : false;
      }),
    })
  ),
});

export type FormValues = {
  firstName: string;
  lastName: string;
  primaryEmail: PrimaryEmail;
  primaryAddress: PrimaryAddress;
  phone: string;
  profileLanguage: Language;
  addresses: Address[];
  emails: Email[];
};

type Props = {
  setEditing: () => void;
  isSubmitting: boolean;
  profile: FormValues;
  onValues: (values: FormValues) => void;
  services?: ServiceConnectionsQuery;
};

export type Primary = 'primaryEmail' | 'primaryAddress';

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

  const changePrimary = (
    formProps: FormikProps<FormValues>,
    arrayHelpers: FieldArrayRenderProps,
    index: number,
    primary: Primary
  ) => {
    const arrayName: 'emails' | 'addresses' =
      arrayHelpers.name === 'emails' ? 'emails' : 'addresses';
    const oldPrimary = { ...formProps.values[primary], primary: false };
    const newPrimary = { ...formProps.values[arrayName][index], primary: true };

    formProps.setFieldValue(primary, newPrimary);
    arrayHelpers.remove(index);
    arrayHelpers.push(oldPrimary);
  };

  const addNewValueToArray = (
    formProps: FormikProps<FormValues>,
    fieldName: keyof FormValues
  ) => {
    const previous: (Email | Address)[] = formProps.getFieldProps(fieldName)
      .value;

    previous.push(formConstants.EMPTY_VALUES[fieldName]);

    formProps.setFieldValue(fieldName, previous);
  };

  return (
    <Formik
      initialValues={{
        ...props.profile,
        primaryAddress: {
          ...props.profile.primaryAddress,
          address: props.profile.primaryAddress.address || '',
          postalCode: props.profile.primaryAddress.postalCode || '',
          city: props.profile.primaryAddress.city || '',
          primary: props.profile.primaryAddress.primary || true,
          countryCode: props.profile.primaryAddress.countryCode || 'FI',
        },
      }}
      onSubmit={values => {
        props.onValues({
          ...values,
          emails: [...values.emails, values.primaryEmail],
          addresses: [...values.addresses, values.primaryAddress],
        });
      }}
      validationSchema={schema}
    >
      {formikProps => (
        <Fragment>
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
                name="primaryAddress.address"
                id="primaryAddress.address"
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
                name="primaryAddress.postalCode"
                id="primaryAddress.postalCode"
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
                name="primaryAddress.city"
                id="primaryAddress.city"
                maxLength="255"
                as={TextInput}
                invalid={getIsInvalid(formikProps, 'city')}
                helperText={getFieldError(formikProps, 'city', {
                  max: 255,
                })}
                labelText={t('profileForm.city')}
              />

              <Field
                id="primaryAddress.countryCode"
                name="primaryAddress.countryCode"
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
                          <AdditionalInformationActions
                            tDelete="profileForm.delete"
                            tPrimary="profileForm.makeEmailPrimary"
                            index={index}
                            arrayHelpers={arrayHelpers}
                            canBeMadePrimary={!!email?.id}
                            makePrimary={() => {
                              changePrimary(
                                formikProps,
                                arrayHelpers,
                                index,
                                'primaryEmail'
                              );
                            }}
                          />
                        </div>
                      )
                    )}
                  </div>
                </React.Fragment>
              )}
            />

            <FieldArray
              name="addresses"
              render={(arrayHelpers: FieldArrayRenderProps) => (
                <React.Fragment>
                  {formikProps?.values?.addresses.map(
                    (address: Address, index: number) => (
                      <div key={index} className={styles.multipleAddresses}>
                        <div
                          className={classNames(
                            styles.formFields,
                            styles.addressFields
                          )}
                        >
                          <Field
                            className={styles.formField}
                            as={TextInput}
                            name={`addresses.${index}.address`}
                            id={`addresses.${index}.address`}
                            labelText={t('profileForm.address')}
                          />

                          <Field
                            className={styles.formField}
                            as={TextInput}
                            name={`addresses.${index}.postalCode`}
                            id={`addresses.${index}.postalCode`}
                            labelText={t('profileForm.postalCode')}
                          />

                          <Field
                            className={styles.formField}
                            as={TextInput}
                            name={`addresses.${index}.city`}
                            id={`addresses.${index}.city`}
                            labelText={t('profileForm.city')}
                          />

                          <Field
                            className={styles.formField}
                            as={Select}
                            name={`addresses.${index}.countryCode`}
                            id={`addresses.${index}.countryCode`}
                            options={countryOptions}
                            labelText={t('profileForm.country')}
                          />
                        </div>
                        <AdditionalInformationActions
                          tDelete="profileForm.delete"
                          tPrimary="profileForm.makeAddressPrimary"
                          index={index}
                          arrayHelpers={arrayHelpers}
                          canBeMadePrimary={!!address?.id}
                          makePrimary={() => {
                            changePrimary(
                              formikProps,
                              arrayHelpers,
                              index,
                              'primaryAddress'
                            );
                          }}
                        />
                      </div>
                    )
                  )}
                </React.Fragment>
              )}
            />
            {/* Add additional field buttons */}
            <Button
              iconLeft={<IconPlusCircle />}
              variant="supplementary"
              type="button"
              onClick={() => addNewValueToArray(formikProps, 'emails')}
            >
              {t('profileForm.addAnotherEmail')}
            </Button>
            <Button
              iconLeft={<IconPlusCircle />}
              variant="supplementary"
              type="button"
              onClick={() => addNewValueToArray(formikProps, 'addresses')}
            >
              {t('profileForm.addAnotherAddress')}
            </Button>

            {/* Form control buttons */}
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
        </Fragment>
      )}
    </Formik>
  );
}

export default EditProfileForm;
