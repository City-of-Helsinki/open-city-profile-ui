import { TextInput } from 'hds-react';
import React from 'react';
import { Field, Formik, FormikProps, Form } from 'formik';
import { useTranslation } from 'react-i18next';
import countries from 'i18n-iso-countries';
import classNames from 'classnames';

import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import { AddressValue, EditDataType } from '../../helpers/editData';
import { createFormFieldHelpers } from '../../helpers/formik';
import { addressSchema } from '../../../common/schemas/schemas';
import FormButtons from '../formButtons/FormButtons';
import EditButtons from '../editButtons/EditButtons';
import FormikDropdown from '../../../common/formikDropdown/FormikDropdown';
import getLanguageCode from '../../../common/helpers/getLanguageCode';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import getCountry from '../../helpers/getCountry';
import { getFormFields } from '../../helpers/formProperties';
import SaveIndicator from '../saveIndicator/SaveIndicator';
import { useCommonEditHandling } from '../../hooks/useCommonEditHandling';
import { RowItemProps } from '../multiItemEditor/MultiItemEditor';
import createActionAriaLabels from '../../helpers/createActionAriaLabels';
import FocusKeeper from '../../../common/focusKeeper/FocusKeeper';
import AccessibleFormikErrors from '../accessibleFormikErrors/AccessibleFormikErrors';

type FormikValues = AddressValue;

function MultiItemAddressRow(props: RowItemProps): React.ReactElement {
  const dataType: EditDataType = 'addresses';
  const { data, testId, disableEditButtons } = props;
  const value = data.value as AddressValue;
  const { address, city, postalCode, countryCode } = value;
  const { t, i18n } = useTranslation();
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
  const formFields = getFormFields(dataType);
  const {
    isNew,
    isEditing,
    actionHandler,
    currentAction,
    editButtonId,
    removeButtonId,
  } = useCommonEditHandling(props);
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
          <Form className={commonFormStyles['multi-item-form']}>
            <h4 className={commonFormStyles['section-title']}>
              {primary
                ? t('profileInformation.primaryAddress')
                : t('profileInformation.address')}
            </h4>
            <FocusKeeper targetId={`${testId}-address`}>
              <div className={commonFormStyles['multi-item-wrapper']}>
                <Field
                  name="address"
                  id={`${testId}-address`}
                  maxLength={formFields.address.max as number}
                  as={TextInput}
                  invalid={hasFieldError(formikProps, 'address')}
                  aria-invalid={hasFieldError(formikProps, 'address')}
                  errorText={getFieldErrorMessage(formikProps, 'address')}
                  label={t(formFields.address.translationKey)}
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
                  label={t(formFields.postalCode.translationKey)}
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
                  label={t(formFields.city.translationKey)}
                  aria-labelledby={`${dataType}-city-helper`}
                  className={formFieldStyle}
                />
                <div className={commonFormStyles['form-field']}>
                  <FormikDropdown
                    name="countryCode"
                    id={`${testId}-countryCode`}
                    options={countryOptions}
                    label={t(formFields.countryCode.translationKey)}
                    default={countryCode}
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
                alignLeft
              />
              <SaveIndicator action={currentAction} testId={testId} />
            </FocusKeeper>
          </Form>
        )}
      </Formik>
    );
  }
  return (
    <div
      className={classNames([
        commonFormStyles['content-wrapper'],
        commonFormStyles['multi-item-content-wrapper'],
      ])}
    >
      <h4 className={commonFormStyles['section-title']}>
        {primary
          ? t('profileInformation.primaryAddress')
          : t('profileInformation.address')}
      </h4>
      <div className={commonFormStyles['multi-item-wrapper']}>
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
      <div className={commonFormStyles['actions-wrapper']}>
        <EditButtons
          handler={actionHandler}
          actions={{
            removable: !primary,
            primary,
            setPrimary: true,
          }}
          buttonClassNames={commonFormStyles['actions-wrapper-button']}
          editButtonId={editButtonId}
          removeButtonId={removeButtonId}
          disabled={disableButtons || disableEditButtons}
          testId={testId}
          ariaLabels={ariaLabels}
        />
        <SaveIndicator action={currentAction} testId={testId} />
      </div>
    </div>
  );
}

export default MultiItemAddressRow;
