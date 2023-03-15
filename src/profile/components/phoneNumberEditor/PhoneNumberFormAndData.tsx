import { PhoneInput } from 'hds-react';
import React from 'react';
import { Field, Formik, FormikProps, Form } from 'formik';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import { PhoneValue } from '../../helpers/editData';
import { createFormFieldHelpers } from '../../helpers/formik';
import { phoneSchema } from '../../../common/schemas/schemas';
import FormButtons from '../formButtons/FormButtons';
import EditButtons from '../editButtons/EditButtons';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import SaveIndicator from '../saveIndicator/SaveIndicator';
import { EditHandling } from '../../hooks/useCommonEditHandling';
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
import AddButton from '../addButton/AddButton';
import EditingNotifications from '../editingNotifications/EditingNotifications';

type PhoneFormikValue = { number: string; countryCallingCode: string };

function PhoneNumberFormAndData({
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
    notificationContent,
  } = editHandler;
  const { t, i18n } = useTranslation();
  const title = t('profileInformation.phone');

  const headingStyle = commonFormStyles['label-size'];
  const containerStyle = commonFormStyles['responsive-flex-box-columns-rows'];
  const flexBoxColumnsStyle = commonFormStyles['flex-box-columns'];

  if (!hasData()) {
    return (
      <div className={flexBoxColumnsStyle}>
        <div className={containerStyle}>
          <div
            className={classNames(
              flexBoxColumnsStyle,
              commonFormStyles['editor-title-and-value']
            )}
          >
            <h3 className={headingStyle}>{title}</h3>
            <span
              data-testid={`${dataType}-no-data`}
              className={commonFormStyles['text-value']}
            >
              {t('profileInformation.noPhone')}
            </span>
          </div>
          <div className={commonFormStyles['edit-buttons']}>
            <div className={commonFormStyles['edit-buttons-container']}>
              <AddButton editHandler={editHandler} />
            </div>
          </div>
        </div>
        <EditingNotifications
          content={notificationContent.content}
          dataType={dataType}
          bottomSpacingDesktop
        />
      </div>
    );
  }

  const data = getData();
  const { value, primary, saving } = data;
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
          <div
            className={classNames(
              flexBoxColumnsStyle,
              commonFormStyles['common-editor-bottom-padding']
            )}
          >
            <h3 className={headingStyle}>{title}</h3>
            <Form>
              <FocusKeeper targetId={`${dropdownId}-input`} autoFocus>
                <div className={flexBoxColumnsStyle}>
                  <div
                    className={classNames(
                      containerStyle,
                      commonFormStyles['editor-form-fields']
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
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
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
                  <EditingNotifications
                    content={notificationContent.content}
                    dataType={dataType}
                    noSpacing
                    topSpacingMobile
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
          </div>
        )}
      </Formik>
    );
  }
  return (
    <div className={flexBoxColumnsStyle}>
      <div className={classNames(containerStyle)}>
        <div
          className={classNames(
            flexBoxColumnsStyle,
            commonFormStyles['editor-title-and-value']
          )}
        >
          <h3 className={headingStyle}>{title}</h3>
          <span
            className={commonFormStyles['text-value']}
            data-testid={`${testId}-value`}
          >
            {inputValue || '–'}
          </span>
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
        </div>
        <SaveIndicator action={currentAction} testId={testId} />
      </div>
      <EditingNotifications
        content={notificationContent.content}
        dataType={dataType}
        bottomSpacingDesktop
      />
    </div>
  );
}

export default PhoneNumberFormAndData;
