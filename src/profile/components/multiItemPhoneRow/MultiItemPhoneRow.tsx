import { PhoneInput } from 'hds-react';
import React from 'react';
import { Field, Formik, FormikProps, Form } from 'formik';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import styles from './multiItemPhoneRow.module.css';
import { EditDataType, PhoneValue } from '../../helpers/editData';
import { createFormFieldHelpers } from '../../helpers/formik';
import { phoneSchema } from '../../../common/schemas/schemas';
import FormButtons from '../formButtons/FormButtons';
import EditButtons from '../editButtons/EditButtons';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import SaveIndicator from '../saveIndicator/SaveIndicator';
import { useCommonEditHandling } from '../../hooks/useCommonEditHandling';
import { RowItemProps } from '../multiItemEditor/MultiItemEditor';
import { getFormFields } from '../../helpers/formProperties';
import createActionAriaLabels from '../../helpers/createActionAriaLabels';
import FocusKeeper from '../../../common/focusKeeper/FocusKeeper';
import AccessibleFormikErrors from '../accessibleFormikErrors/AccessibleFormikErrors';
import FormikDropdown, {
  OptionType,
} from '../../../common/formikDropdown/FormikDropdown';
import getLanguageCode from '../../../common/helpers/getLanguageCode';
import {
  getDefaultCountryCallingCode,
  getMemoizedCountryCallingCodes,
  splitNumberAndCountryCallingCode,
} from '../../../i18n/countryCallingCodes.utils';

type PhoneFormikValue = { number: string; countryCallingCode: string };

function MultiItemPhoneRow(props: RowItemProps): React.ReactElement {
  const {
    data: { value, primary, saving },
    testId,
    disableEditButtons,
  } = props;
  const dataType: EditDataType = 'phones';
  const { t, i18n } = useTranslation();
  const {
    isEditing,
    currentAction,
    actionHandler,
    isNew,
    editButtonId,
    removeButtonId,
  } = useCommonEditHandling(props);
  const inputValue: string = (value as PhoneValue).phone || '';
  const inputId = `${testId}-number`;
  const dropdownId = `${testId}-countryCallingCode`;
  const formFields = getFormFields(dataType);
  const disableButtons = !!currentAction || !!saving;
  const { hasFieldError, getFieldErrorMessage } = createFormFieldHelpers<
    PhoneFormikValue
  >(t, isNew);
  const ariaLabels = createActionAriaLabels(dataType, inputValue, t);
  if (isEditing) {
    const countryCallingCodes = getMemoizedCountryCallingCodes(
      getLanguageCode(i18n.languages[0])
    );
    const { countryCallingCode, number } = splitNumberAndCountryCallingCode(
      (value as PhoneValue).phone || ''
    );
    const initialCountryCallingCodeOption = countryCallingCodes.find(
      option => option.value === countryCallingCode
    ) as OptionType;

    const defaultCountryCallingCodeValue = getDefaultCountryCallingCode();
    const defaultCountryCallingCodeOption = countryCallingCodes.find(
      option => option.value === defaultCountryCallingCodeValue
    ) as OptionType;

    return (
      <Formik
        initialValues={{
          number,
          countryCallingCode,
        }}
        onSubmit={async values => {
          await actionHandler('save', {
            phone: `${values.countryCallingCode}${values.number}`,
          });
        }}
        validationSchema={phoneSchema}
      >
        {(formikProps: FormikProps<PhoneFormikValue>) => (
          <Form className={commonFormStyles['multi-item-form']}>
            <div className={commonFormStyles['section-title-with-explanation']}>
              <h2 className={commonFormStyles['section-title']}>
                {t('profileInformation.phone')}
              </h2>
              {isNew && <p>{t('profileInformation.noPhone')}</p>}
            </div>
            <FocusKeeper targetId={`${dropdownId}-input`} autoFocus>
              <div className={styles['editable-row']}>
                <div
                  className={classNames(
                    commonFormStyles['multi-item-wrapper'],
                    styles['input-wrapper']
                  )}
                >
                  <FormikDropdown
                    className={classNames(commonFormStyles['form-field'])}
                    name={'countryCallingCode'}
                    id={dropdownId}
                    label={t('profileForm.countryCallingCode')}
                    options={countryCallingCodes}
                    defaultOption={defaultCountryCallingCodeOption}
                    disabled={!!saving}
                    invalid={hasFieldError(formikProps, 'countryCallingCode')}
                    error={getFieldErrorMessage(
                      formikProps,
                      'countryCallingCode'
                    )}
                    aria-describedby={`${dataType}-countryCallingCode-helper`}
                    toggleButtonAriaLabel={t(
                      'profileInformation.ariaShowOptions'
                    )}
                    onChange={option => {
                      formikProps.setFieldValue(
                        'countryCallingCode',
                        option ? option.value : ''
                      );
                    }}
                    allowSearch
                    virtualized
                    initialOption={initialCountryCallingCodeOption}
                  />
                  <Field
                    className={commonFormStyles['form-field']}
                    name="number"
                    id={inputId}
                    maxLength={formFields.number.max as number}
                    as={PhoneInput}
                    invalid={hasFieldError(formikProps, 'number')}
                    aria-invalid={hasFieldError(formikProps, 'number')}
                    errorText={getFieldErrorMessage(formikProps, 'number')}
                    aria-labelledby={`${dataType}-number-helper`}
                    disabled={!!saving}
                    label={t('profileForm.phone')}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      formikProps.setFieldValue(
                        'number',
                        event.target.value.replace(/\D/g, '')
                      );
                    }}
                  />
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
              </div>
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
      <h2 className={commonFormStyles['section-title']}>
        {t('profileInformation.phone')}
      </h2>
      <div
        className={classNames(
          commonFormStyles['multi-item-wrapper'],
          styles['input-wrapper']
        )}
      >
        <span className={styles['value']} data-testid={`${testId}-value`}>
          {inputValue || '–'}
        </span>
      </div>
      <div className={commonFormStyles['actions-wrapper']}>
        <EditButtons
          handler={actionHandler}
          actions={{
            removable: true,
            primary,
            setPrimary: false,
          }}
          buttonClassNames={commonFormStyles['actions-wrapper-button']}
          editButtonId={editButtonId}
          removeButtonId={removeButtonId}
          disabled={disableButtons || disableEditButtons}
          testId={testId}
          ariaLabels={ariaLabels}
        />
      </div>
      <SaveIndicator action={currentAction} testId={testId} />
    </div>
  );
}

export default MultiItemPhoneRow;
