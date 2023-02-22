import { TextInput } from 'hds-react';
import React from 'react';
import { Field, Formik, FormikProps, Form } from 'formik';
import { useTranslation } from 'react-i18next';
import countries from 'i18n-iso-countries';
import classNames from 'classnames';

import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import { AddressValue } from '../../helpers/editData';
import { createFormFieldHelpers } from '../../helpers/formik';
import { addressSchema } from '../../../common/schemas/schemas';
import FormButtons from '../formButtons/FormButtons';
import EditButtons from '../editButtons/EditButtons';
import FormikDropdown, {
  OptionType,
} from '../../../common/formikDropdown/FormikDropdown';
import getLanguageCode from '../../../common/helpers/getLanguageCode';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import getCountry from '../../helpers/getCountry';
import { getFormFields } from '../../helpers/formProperties';
import SaveIndicator from '../saveIndicator/SaveIndicator';
import { EditHandling } from '../../hooks/useCommonEditHandling';
import createActionAriaLabels from '../../helpers/createActionAriaLabels';
import FocusKeeper from '../../../common/focusKeeper/FocusKeeper';
import AccessibleFormikErrors from '../accessibleFormikErrors/AccessibleFormikErrors';
import { RequiredFieldsNote } from '../../../common/requiredFieldsNote/RequiredFieldsNote';
import { useVerifiedPersonalInformation } from '../../context/ProfileContext';
import AddButton from '../multiItemEditor/AddButton';

type FormikValues = AddressValue;

function MultiItemAddressRow({
  editHandler,
}: {
  editHandler: EditHandling;
}): React.ReactElement {
  const {
    getData,
    hasData,
    testId,
    isEditing,
    currentAction,
    actionHandler,
    isNew,
    editButtonId,
    removeButtonId,
    dataType,
  } = editHandler;
  const { t, i18n } = useTranslation();
  const userIsVerified = !!useVerifiedPersonalInformation();
  const title = userIsVerified
    ? t('profileInformation.addressTitleWhenHasVerifiedData')
    : t('profileInformation.address');

  const description = userIsVerified
    ? t('profileInformation.addressDescriptionNoWeakAddress')
    : t('profileInformation.addressDescriptionNoAddress');
  const containerStyle = commonFormStyles['responsive-flex-box-columns-rows'];
  const DescriptionElement = (): React.ReactElement | null => {
    if (hasData() && !isNew) {
      return <p>{t('profileInformation.addressDescription')}</p>;
    }
    return <p data-testid={`${dataType}-no-data`}>{description}</p>;
  };

  const Explanation = () => (
    <div
      className={classNames(
        commonFormStyles['editor-description-container'],
        commonFormStyles['bottom-border']
      )}
    >
      <h2>{title}</h2>
      <DescriptionElement />
    </div>
  );

  if (!hasData()) {
    return (
      <div className={classNames(commonFormStyles['flex-box-columns'])}>
        <Explanation />
        <div
          className={classNames(
            commonFormStyles['edit-buttons'],
            commonFormStyles['form-buttons']
          )}
        >
          <AddButton editHandler={editHandler} />
        </div>
      </div>
    );
  }

  const data = getData();
  const value = data.value as AddressValue;
  const { address, city, postalCode, countryCode } = value;
  const lang = i18n.languages[0];
  const applicationLanguage = getLanguageCode(i18n.languages[0]);
  const countryList = countries.getNames(applicationLanguage);
  const countryOptions = Object.keys(countryList)
    .map(key => ({
      value: key,
      label: countryList[key],
    }))
    .sort((a, b) => {
      if (a.label < b.label) {
        return -1;
      }
      if (a.label > b.label) {
        return 1;
      }
      return 0;
    });
  const defaultCountryOption = countryOptions[0];
  const initialCountryOption = countryOptions.find(
    option => option.value === countryCode
  ) as OptionType;
  const formFields = getFormFields(dataType);

  const { hasFieldError, getFieldErrorMessage } = createFormFieldHelpers<
    FormikValues
  >(t, isNew);

  const { primary, saving } = data;
  const disableButtons = !!currentAction || !!saving;
  const ariaLabels = createActionAriaLabels(dataType, value.address, t);
  const formFieldStyle = commonFormStyles['form-field'];

  if (isEditing) {
    return (
      <Formik
        initialValues={{
          address,
          city,
          postalCode,
          countryCode,
        }}
        onSubmit={async values => {
          await actionHandler('save', values);
        }}
        validationSchema={addressSchema}
      >
        {(formikProps: FormikProps<FormikValues>) => (
          <Form>
            <Explanation />
            <RequiredFieldsNote />
            <FocusKeeper targetId={`${testId}-address`}>
              <div
                className={classNames(
                  containerStyle,
                  commonFormStyles['editor-form-fields']
                )}
              >
                <Field
                  name="address"
                  id={`${testId}-address`}
                  maxLength={formFields.address.max as number}
                  as={TextInput}
                  invalid={hasFieldError(formikProps, 'address')}
                  aria-invalid={hasFieldError(formikProps, 'address')}
                  errorText={getFieldErrorMessage(formikProps, 'address')}
                  label={`${t(formFields.address.translationKey)} *`}
                  autoFocus
                  aria-labelledby={`${dataType}-address-helper`}
                  className={formFieldStyle}
                />
                <Field
                  name="postalCode"
                  id={`${testId}-postalCode`}
                  maxLength={formFields.postalCode.max as number}
                  as={TextInput}
                  invalid={hasFieldError(formikProps, 'postalCode')}
                  aria-invalid={hasFieldError(formikProps, 'postalCode')}
                  errorText={getFieldErrorMessage(formikProps, 'postalCode')}
                  label={`${t(formFields.postalCode.translationKey)} *`}
                  aria-labelledby={`${dataType}-postalCode-helper`}
                  className={formFieldStyle}
                />
                <Field
                  name="city"
                  id={`${testId}-city`}
                  maxLength={formFields.city.max as number}
                  as={TextInput}
                  invalid={hasFieldError(formikProps, 'city')}
                  aria-invalid={hasFieldError(formikProps, 'city')}
                  errorText={getFieldErrorMessage(formikProps, 'city')}
                  label={`${t(formFields.city.translationKey)} *`}
                  aria-labelledby={`${dataType}-city-helper`}
                  className={formFieldStyle}
                />
                <div className={commonFormStyles['form-field']}>
                  <FormikDropdown
                    name="countryCode"
                    id={`${testId}-countryCode`}
                    options={countryOptions}
                    label={`${t(formFields.countryCode.translationKey)} *`}
                    defaultOption={defaultCountryOption}
                    invalid={hasFieldError(formikProps, 'countryCode')}
                    error={getFieldErrorMessage(formikProps, 'countryCode')}
                    aria-describedby={`${dataType}-countryCode-helper`}
                    toggleButtonAriaLabel={t(
                      'profileInformation.ariaShowOptions'
                    )}
                    allowSearch
                    onChange={option =>
                      formikProps.setFieldValue(
                        'countryCode',
                        option ? option.value : ''
                      )
                    }
                    initialOption={initialCountryOption}
                  />
                </div>
              </div>
              <AccessibleFormikErrors
                formikProps={formikProps}
                dataType={dataType}
              />
              <FormButtons
                handler={actionHandler}
                disabled={disableButtons}
                testId={testId}
              />
              <SaveIndicator action={currentAction} testId={testId} />
            </FocusKeeper>
          </Form>
        )}
      </Formik>
    );
  }
  return (
    <div className={classNames(commonFormStyles['flex-box-columns'])}>
      <div className={commonFormStyles['editor-description-container']}>
        <h2>{title}</h2>
        <DescriptionElement />
      </div>
      <div className={classNames(containerStyle)}>
        <div
          className={classNames(
            containerStyle,
            commonFormStyles['editor-text-fields']
          )}
        >
          <LabeledValue
            label={t(formFields.address.translationKey)}
            value={value.address}
            testId={`${testId}-address`}
          />
          <LabeledValue
            label={t(formFields.postalCode.translationKey)}
            value={value.postalCode}
            testId={`${testId}-postalCode`}
          />
          <LabeledValue
            label={t(formFields.city.translationKey)}
            value={value.city}
            testId={`${testId}-city`}
          />
          <LabeledValue
            label={t(formFields.countryCode.translationKey)}
            value={getCountry(value.countryCode, lang)}
            testId={`${testId}-countryCode`}
          />
        </div>
        <div className={commonFormStyles['edit-buttons']}>
          <EditButtons
            handler={actionHandler}
            actions={{
              removable: true,
              primary,
              setPrimary: false,
            }}
            editButtonId={editButtonId}
            removeButtonId={removeButtonId}
            disabled={disableButtons}
            testId={testId}
            ariaLabels={ariaLabels}
          />
          <SaveIndicator action={currentAction} testId={testId} />
        </div>
      </div>
    </div>
  );
}

export default MultiItemAddressRow;
