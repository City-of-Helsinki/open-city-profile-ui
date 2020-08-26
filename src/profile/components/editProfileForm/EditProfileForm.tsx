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
import styles from './EditProfileForm.module.css';
import {
  Language,
  MyProfileQuery_myProfile_addresses_edges_node as Address,
  MyProfileQuery_myProfile_emails_edges_node as Email,
  MyProfileQuery_myProfile_phones_edges_node as Phone,
  MyProfileQuery_myProfile_primaryAddress as PrimaryAddress,
  MyProfileQuery_myProfile_primaryEmail as PrimaryEmail,
  MyProfileQuery_myProfile_primaryPhone as PrimaryPhone,
  ServiceConnectionsQuery,
} from '../../../graphql/generatedTypes';
import profileConstants from '../../constants/profileConstants';
import ConfirmationModal from '../modals/confirmationModal/ConfirmationModal';
import AdditionalInformationActions from './AdditionalInformationActions';
import FormikDropdown, {
  OptionType,
  HdsOptionType,
} from '../../../common/formikDropdown/FormikDropdown';

const address = yup.object().shape({
  address: yup.string().max(128, 'validation.maxLength'),
  city: yup.string().max(64, 'validation.maxLength'),
  postalCode: yup.string().max(5, 'validation.maxLength'),
});

const phone = yup.object().shape({
  phone: yup
    .string()
    .min(6, 'validation.phoneMin')
    .max(255, 'validation.maxLength'),
});

const schema = yup.object().shape({
  firstName: yup.string().max(255, 'validation.maxLength'),
  lastName: yup.string().max(255, 'validation.maxLength'),
  language: yup.string(),
  primaryPhone: phone,
  primaryAddress: address,
  addresses: yup.array().of(address),
  emails: yup.array().of(
    yup.object().shape({
      email: yup.mixed().test('isValidEmail', 'validation.email', function() {
        return this.parent?.email
          ? validator.isEmail(this.parent?.email)
          : false;
      }),
    })
  ),
  phones: yup.array().of(phone),
});

export type FormValues = {
  firstName: string;
  lastName: string;
  primaryEmail: PrimaryEmail;
  primaryAddress: PrimaryAddress;
  primaryPhone: PrimaryPhone;
  profileLanguage: Language;
  addresses: Address[];
  emails: Email[];
  phones: Phone[];
};

type Props = {
  setEditing: () => void;
  isSubmitting: boolean;
  profile: FormValues;
  onValues: (values: FormValues) => void;
  services?: ServiceConnectionsQuery;
};

export type Primary = 'primaryEmail' | 'primaryAddress' | 'primaryPhone';
type ArrayName = 'emails' | 'addresses' | 'phones';

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
    const arrayName: ArrayName = arrayHelpers.name as ArrayName;

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
    const previous: (Email | Address | Phone)[] = formProps.getFieldProps(
      fieldName
    ).value;

    previous.push(formConstants.EMPTY_VALUES[fieldName]);

    formProps.setFieldValue(fieldName, previous);
  };

  const profileLanguageOptions: OptionType[] = profileConstants.LANGUAGES.map(
    language => {
      return {
        value: language,
        label: t(`LANGUAGE_OPTIONS.${language}`),
      };
    }
  );
  return (
    <Formik
      initialValues={{
        ...props.profile,
        primaryAddress: {
          ...props.profile.primaryAddress,
          address: props.profile.primaryAddress.address || '',
          postalCode: props.profile.primaryAddress.postalCode || '',
          city: props.profile.primaryAddress.city || '',
          // User can not add address when registering. Set primary field to true by default
          // so it gets added to correct place
          primary: props.profile.primaryAddress.primary || true,
          countryCode: props.profile.primaryAddress.countryCode || 'FI',
          __typename: props.profile.primaryAddress.__typename || 'AddressNode',
        },
        primaryPhone: {
          ...props.profile.primaryPhone,
          // Phone is not required while registering. Set primary field to true by default
          // so it gets added to correct place
          primary: props.profile.primaryPhone.primary || true,
          phone: props.profile.primaryPhone.phone || '',
          __typename: props.profile.primaryPhone.__typename || 'PhoneNode',
        },
      }}
      onSubmit={async values => {
        props.onValues({
          ...values,
          emails: [...values.emails, values.primaryEmail],
          addresses: [...values.addresses, values.primaryAddress],
          phones: [...values.phones, values.primaryPhone],
        });
      }}
      validationSchema={schema}
    >
      {(formikProps: FormikProps<FormValues>) => (
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
                name="primaryPhone.phone"
                id="primaryPhone.phone"
                as={TextInput}
                type="tel"
                minLength="6"
                maxLength="255"
                invalid={getIsInvalid(formikProps, 'primaryPhone.phone')}
                helperText={getFieldError(formikProps, 'primaryPhone.phone', {
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
                invalid={getIsInvalid(formikProps, 'primaryAddress.address')}
                helperText={getFieldError(
                  formikProps,
                  'primaryAddress.address',
                  {
                    max: 255,
                  }
                )}
                labelText={t('profileForm.address')}
              />

              <Field
                className={styles.formField}
                name="primaryAddress.postalCode"
                id="primaryAddress.postalCode"
                maxLength="5"
                as={TextInput}
                invalid={getIsInvalid(formikProps, 'primaryAddress.postalCode')}
                helperText={getFieldError(
                  formikProps,
                  'primaryAddress.postalCode',
                  {
                    max: 5,
                  }
                )}
                labelText={t('profileForm.postalCode')}
              />

              <Field
                className={styles.formField}
                name="primaryAddress.city"
                id="primaryAddress.city"
                maxLength="255"
                as={TextInput}
                invalid={getIsInvalid(formikProps, 'primaryAddress.city')}
                helperText={getFieldError(formikProps, 'primaryAddress.city', {
                  max: 255,
                })}
                labelText={t('profileForm.city')}
              />
              <FormikDropdown
                className={styles.formField}
                id="primaryAddress.countryCode"
                name="primaryAddress.countryCode"
                options={countryOptions}
                default={formikProps.values.primaryAddress.countryCode}
                label={t('profileForm.country')}
                onChange={(option: HdsOptionType) =>
                  formikProps.setFieldValue(
                    'primaryAddress.countryCode' as 'primaryAddress',
                    option.value
                  )
                }
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
              name="phones"
              render={(arrayHelpers: FieldArrayRenderProps) => (
                <React.Fragment>
                  <div className={styles.formFields}>
                    {formikProps.values.phones.map(
                      (phone: Phone, index: number) => (
                        <div className={styles.formField} key={index}>
                          <Field
                            className={styles.formField}
                            as={TextInput}
                            name={`phones.${index}.phone`}
                            id={`phones.${index}.phone`}
                            labelText={t('profileForm.phone')}
                            type="tel"
                            minLength="6"
                            maxLength="255"
                            invalid={getIsInvalid(
                              formikProps,
                              `phones.${index}.phone`
                            )}
                            helperText={getFieldError(
                              formikProps,
                              `phones.${index}.phone`,
                              {
                                min: 6,
                                max: 255,
                              }
                            )}
                          />
                          <AdditionalInformationActions
                            tDelete="profileForm.delete"
                            tPrimary="profileForm.makePhonePrimary"
                            index={index}
                            arrayHelpers={arrayHelpers}
                            canBeMadePrimary={!!phone.id}
                            makePrimary={() =>
                              changePrimary(
                                formikProps,
                                arrayHelpers,
                                index,
                                'primaryPhone'
                              )
                            }
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
                            maxLength="128"
                            name={`addresses.${index}.address`}
                            id={`addresses.${index}.address`}
                            labelText={t('profileForm.address')}
                            invalid={getIsInvalid(
                              formikProps,
                              `addresses.${index}.address`
                            )}
                            helperText={getFieldError(
                              formikProps,
                              `addresses.${index}.address`,
                              {
                                max: 128,
                              }
                            )}
                          />

                          <Field
                            className={styles.formField}
                            maxLength="5"
                            as={TextInput}
                            name={`addresses.${index}.postalCode`}
                            id={`addresses.${index}.postalCode`}
                            labelText={t('profileForm.postalCode')}
                            invalid={getIsInvalid(
                              formikProps,
                              `addresses.${index}.postalCode`
                            )}
                            helperText={getFieldError(
                              formikProps,
                              `addresses.${index}.postalCode`,
                              {
                                max: 5,
                              }
                            )}
                          />

                          <Field
                            className={styles.formField}
                            as={TextInput}
                            maxLength="64"
                            name={`addresses.${index}.city`}
                            id={`addresses.${index}.city`}
                            labelText={t('profileForm.city')}
                            invalid={getIsInvalid(
                              formikProps,
                              `addresses.${index}.city`
                            )}
                            helperText={getFieldError(
                              formikProps,
                              `addresses.${index}.city`,
                              {
                                max: 64,
                              }
                            )}
                          />

                          <FormikDropdown
                            className={styles.formField}
                            name={`addresses.${index}.countryCode`}
                            id={`addresses.${index}.countryCode`}
                            options={countryOptions}
                            label={t('profileForm.country')}
                            default={
                              formikProps.values.addresses[index].countryCode
                            }
                            onChange={(option: HdsOptionType) =>
                              formikProps.setFieldValue(
                                `addresses.${index}.countryCode` as 'addresses',
                                option.value
                              )
                            }
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
              onClick={() => addNewValueToArray(formikProps, 'phones')}
            >
              {t('profileForm.addAnotherPhone')}
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
