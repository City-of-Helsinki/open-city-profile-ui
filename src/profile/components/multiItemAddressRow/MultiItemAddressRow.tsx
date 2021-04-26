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
  HdsOptionType,
} from '../../../common/formikDropdown/FormikDropdown';
import getLanguageCode from '../../../common/helpers/getLanguageCode';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import getCountry from '../../helpers/getCountry';
import { getFormFields } from '../../helpers/formProperties';
import SaveIndicator from '../saveIndicator/SaveIndicator';
import { useCommonEditHandling } from '../../hooks/useCommonEditHandling';
import { RowItemProps } from '../multiItemEditor/MultiItemEditor';

type FormikValues = AddressValue;

function MultiItemAddressRow(props: RowItemProps): React.ReactElement {
  const { data, testId, dataType } = props;
  const value = data.value as AddressValue;
  const { address, city, postalCode, countryCode } = value;
  const { t, i18n } = useTranslation();
  const lang = i18n.languages[0];
  const applicationLanguage = getLanguageCode(i18n.languages[0]);
  const countryList = countries.getNames(applicationLanguage);
  const countryOptions = Object.keys(countryList).map(key => ({
    value: key,
    label: countryList[key],
  }));
  const formFields = getFormFields(dataType);
  const {
    isNew,
    isEditing,
    actionHandler,
    currentAction,
  } = useCommonEditHandling(props);
  const { hasFieldError, getFieldErrorMessage } = createFormFieldHelpers<
    FormikValues
  >(t, isNew);

  const { primary } = data;

  if (isEditing) {
    return (
      <Formik
        initialValues={{
          address,
          city,
          postalCode,
          countryCode,
          primary: !!primary,
        }}
        onSubmit={async values => {
          await actionHandler('save', values);
        }}
        validationSchema={addressSchema}
      >
        {(formikProps: FormikProps<FormikValues>) => (
          <Form className={commonFormStyles.multiItemForm}>
            <h4 className={commonFormStyles.sectionTitle}>
              {primary
                ? t('profileInformation.primaryAddress')
                : t('profileInformation.address')}
            </h4>
            <div className={commonFormStyles.multiItemWrapper}>
              <Field
                name="address"
                id={`${testId}-address`}
                maxLength={formFields.address.max as number}
                as={TextInput}
                invalid={hasFieldError(formikProps, 'address')}
                aria-invalid={hasFieldError(formikProps, 'address')}
                helperText={getFieldErrorMessage(formikProps, 'address')}
                labelText={t(formFields.address.translationKey)}
                autoFocus
                aria-labelledby={`${dataType}-address-helper`}
              />
              <Field
                name="postalCode"
                id={`${testId}-postalCode`}
                maxLength={formFields.postalCode.max as number}
                as={TextInput}
                invalid={hasFieldError(formikProps, 'postalCode')}
                aria-invalid={hasFieldError(formikProps, 'postalCode')}
                helperText={getFieldErrorMessage(formikProps, 'postalCode')}
                labelText={t(formFields.postalCode.translationKey)}
                aria-labelledby={`${dataType}-postalCode-helper`}
              />
              <Field
                name="city"
                id={`${testId}-city`}
                maxLength={formFields.city.max as number}
                as={TextInput}
                invalid={hasFieldError(formikProps, 'city')}
                aria-invalid={hasFieldError(formikProps, 'city')}
                helperText={getFieldErrorMessage(formikProps, 'city')}
                labelText={t(formFields.city.translationKey)}
                aria-labelledby={`${dataType}-city-helper`}
              />
              <div className={commonFormStyles.formField}>
                <FormikDropdown
                  name="countryCode"
                  id={`${testId}-countryCode`}
                  options={countryOptions}
                  label={t(formFields.country.translationKey)}
                  default={countryCode}
                  onChange={option =>
                    formikProps.setFieldValue(
                      'countryCode',
                      (option as HdsOptionType).value
                    )
                  }
                />
              </div>
            </div>
            <FormButtons
              handler={actionHandler}
              disabled={!!currentAction}
              testId={testId}
              alignLeft
            />
            <SaveIndicator action={currentAction} testId={testId} />
          </Form>
        )}
      </Formik>
    );
  }
  return (
    <div
      className={classNames([
        commonFormStyles.contentWrapper,
        commonFormStyles.multiItemContentWrapper,
      ])}
    >
      <h4 className={commonFormStyles.sectionTitle}>
        {primary
          ? t('profileInformation.primaryAddress')
          : t('profileInformation.address')}
      </h4>
      <div className={commonFormStyles.multiItemWrapper}>
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
          label={t(formFields.country.translationKey)}
          value={getCountry(value.countryCode, lang)}
          testId={`${testId}-countryCode`}
        />
      </div>
      <div className={commonFormStyles.actionsWrapper}>
        <EditButtons
          handler={actionHandler}
          actions={{
            removable: false,
            primary,
            setPrimary: false,
          }}
          buttonClassNames={commonFormStyles.actionsWrapperButton}
          editButtonId={`${testId}-edit-button`}
          disabled={!!currentAction}
          testId={testId}
        />
        <SaveIndicator action={currentAction} testId={testId} />
      </div>
    </div>
  );
}

export default MultiItemAddressRow;
