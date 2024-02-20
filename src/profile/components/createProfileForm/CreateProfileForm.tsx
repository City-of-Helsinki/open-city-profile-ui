import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Button, TextInput, Checkbox, PhoneInput } from 'hds-react';
import { Formik, Form, Field, FormikProps } from 'formik';
import * as yup from 'yup';
import classNames from 'classnames';

import { getIsInvalid, getFieldError } from '../../helpers/formik';
import FormikDropdown, {
  OptionType,
} from '../../../common/formikDropdown/FormikDropdown';
import styles from './CreateProfileForm.module.css';
import profileConstants from '../../constants/profileConstants';
import { Language } from '../../../graphql/typings';
import { getFormFields } from '../../helpers/formProperties';
import {
  basicDataSchema,
  createProfilePhoneSchema,
} from '../../../common/schemas/schemas';
import { Link } from '../../../common/copyOfHDSLink/Link';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import getLanguageCode from '../../../common/helpers/getLanguageCode';
import {
  getMemoizedCountryCallingCodes,
  getDefaultCountryCallingCode,
} from '../../../i18n/countryCallingCodes.utils';

const termsSchema = yup
  .object()
  .shape({ terms: yup.boolean().oneOf([true], 'validation.required') });
const schema = basicDataSchema
  .concat(termsSchema)
  .concat(createProfilePhoneSchema);

export type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  number: string;
  countryCallingCode: string;
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

function CreateProfileForm(props: Props): React.ReactElement {
  const { t, i18n } = useTranslation();
  const formFields = getFormFields('basic-data');
  const phoneFields = getFormFields('phones');
  const [submitAttempted, setSubmitAttempted] = useState<boolean>(false);
  const hasFieldError = (
    formikProps: FormikProps<FormikFormValues>,
    fieldName: keyof FormikFormValues
  ): boolean =>
    getIsInvalid<FormikFormValues>(formikProps, fieldName, submitAttempted);

  const getFieldErrorMessage = (
    formikProps: FormikProps<FormikFormValues>,
    fieldName: keyof FormikFormValues
  ) => {
    if (!hasFieldError(formikProps, fieldName)) {
      return undefined;
    }
    return getFieldError<FormikFormValues>(
      t,
      formikProps,
      fieldName,
      submitAttempted
    );
  };
  const countryCallingCodesList = getMemoizedCountryCallingCodes(
    getLanguageCode(i18n.languages[0])
  );
  const defaultCountryCallingCodeValue = getDefaultCountryCallingCode();
  const defaultCountryCallingCodeOption = countryCallingCodesList.find(
    option => option.value === defaultCountryCallingCodeValue
  ) as OptionType;

  const profileLanguageOptions = profileConstants.LANGUAGES.map(language => ({
    value: language,
    label: t(`LANGUAGE_OPTIONS.${language}`),
  }));
  const defaultLanguageOption = profileLanguageOptions[0];
  const formFieldStyle = classNames([
    styles['form-field'],
    commonFormStyles['form-field'],
  ]);
  const containerStyle = classNames([
    styles['form-fields'],
    commonFormStyles['responsive-flex-box-columns-rows'],
    commonFormStyles['editor-form-fields'],
  ]);
  return (
    <Formik
      initialValues={{
        ...props.profile,
        countryCallingCode: getDefaultCountryCallingCode(),
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
          number: values.number,
          countryCallingCode: values.countryCallingCode,
          profileLanguage: values.profileLanguage,
        });
      }}
      validationSchema={schema}
    >
      {formikProps => (
        <Form>
          <div className={containerStyle}>
            <Field
              className={formFieldStyle}
              name="firstName"
              id="create-profile-firstName"
              maxLength={formFields.firstName.max as number}
              as={TextInput}
              invalid={hasFieldError(formikProps, 'firstName')}
              errorText={getFieldErrorMessage(formikProps, 'firstName')}
              label={t('profileForm.firstName')}
            />
            <Field
              className={formFieldStyle}
              name="lastName"
              id="create-profile-lastName"
              maxLength={formFields.lastName.max as number}
              as={TextInput}
              invalid={hasFieldError(formikProps, 'lastName')}
              errorText={getFieldErrorMessage(formikProps, 'lastName')}
              label={t('profileForm.lastName')}
            />

            <FormikDropdown
              className={formFieldStyle}
              id="create-profile-profileLanguage"
              name={'profileLanguage'}
              options={profileLanguageOptions}
              defaultOption={defaultLanguageOption}
              label={t('profileForm.language')}
              onChange={option =>
                formikProps.setFieldValue('profileLanguage', option.value)
              }
            />
            <FormikDropdown
              className={formFieldStyle}
              name={'countryCallingCode'}
              id={'create-profile-countryCallingCode'}
              label={t('profileForm.countryCallingCode')}
              options={countryCallingCodesList}
              defaultOption={defaultCountryCallingCodeOption}
              invalid={hasFieldError(formikProps, 'countryCallingCode')}
              error={getFieldErrorMessage(formikProps, 'countryCallingCode')}
              toggleButtonAriaLabel={t('profileInformation.ariaShowOptions')}
              onChange={option => {
                formikProps.setFieldValue(
                  'countryCallingCode',
                  option ? option.value : ''
                );
              }}
              allowSearch
              virtualized
            />
            <Field
              className={formFieldStyle}
              name="number"
              id="create-profile-number"
              as={PhoneInput}
              maxLength={phoneFields.number.max as number}
              invalid={hasFieldError(formikProps, 'number')}
              errorText={getFieldErrorMessage(formikProps, 'number')}
              label={t('profileForm.phone')}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                formikProps.setFieldValue(
                  'number',
                  event.target.value.replace(/\D/g, '')
                );
              }}
            />

            <div className={formFieldStyle}>
              <TextInput
                id={'create-profile-email'}
                readOnly
                label={t('profileForm.email')}
                defaultValue={props.profile.email}
              />
            </div>
          </div>

          <div className={styles['terms']}>
            <p>
              <Trans
                i18nKey="profileForm.terms"
                components={{
                  fileDescriptionLink: (
                    <Link
                      href={t('profileForm.termsFileDescriptionLink')}
                      external
                      openInNewTab
                    >
                      {''}
                    </Link>
                  ),
                  dataProtectionLink: (
                    <Link
                      href={t('profileForm.termsDataProtectionLink')}
                      external
                      openInNewTab
                    >
                      {''}
                    </Link>
                  ),
                }}
              />
            </p>
            <Field
              as={Checkbox}
              name="terms"
              id="create-profile-terms"
              checked={formikProps.values.terms}
              label={t('profileForm.termsLabel')}
            />
          </div>
          <div>
            <Button
              variant="primary"
              type="submit"
              disabled={Boolean(
                formikProps.isSubmitting ||
                  formikProps.errors.terms ||
                  props.isSubmitting
              )}
              onClick={() => {
                if (!submitAttempted) {
                  setSubmitAttempted(true);
                }
              }}
              data-testid={'create-profile-submit-button'}
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
