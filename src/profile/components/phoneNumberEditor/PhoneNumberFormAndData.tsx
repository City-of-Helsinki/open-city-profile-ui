import { PhoneInput, Option } from 'hds-react';
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import { PhoneValue } from '../../helpers/editData';
import { createFormFieldHelpers } from '../../helpers/formFields';
import { phoneSchema } from '../../../common/schemas/schemas';
import FormButtons from '../formButtons/FormButtons';
import EditButtons from '../editButtons/EditButtons';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import SaveIndicator from '../saveIndicator/SaveIndicator';
import { EditHandling } from '../../hooks/useCommonEditHandling';
import { getFormFields } from '../../helpers/formProperties';
import createActionAriaLabels from '../../helpers/createActionAriaLabels';
import FocusKeeper from '../../../common/focusKeeper/FocusKeeper';
import AccessibleFormErrors from '../accessibleFormErrors/AccessibleFormErrors';
import FormDropdown from '../../../common/formDropdown/FormDropdown';
import getLanguageCode from '../../../common/helpers/getLanguageCode';
import {
  getDefaultCountryCallingCode,
  getMemoizedCountryCallingCodes,
  splitNumberAndCountryCallingCode,
} from '../../../i18n/countryCallingCodes.utils';
import AddButton from '../addButton/AddButton';
import EditingNotifications from '../editingNotifications/EditingNotifications';

type PhoneFormValue = { number: string; countryCallingCode: string };

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

  // Pre-compute initial phone values so hooks can be called unconditionally
  const existingPhone = hasData()
    ? (getData().value as PhoneValue).phone || ''
    : '';
  const { countryCallingCode: initialCC, number: initialNumber } =
    splitNumberAndCountryCallingCode(existingPhone);

  const { handleSubmit, formState, setValue, reset, control } =
    useForm<PhoneFormValue>({
      defaultValues: { number: initialNumber, countryCallingCode: initialCC },
      resolver: yupResolver(phoneSchema),
    });

  useEffect(() => {
    if (isEditing) {
      const phone = hasData()
        ? (getData().value as PhoneValue).phone || ''
        : '';
      const { countryCallingCode, number } =
        splitNumberAndCountryCallingCode(phone);
      reset({ number, countryCallingCode });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

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
  const { hasFieldError, getFieldErrorMessage } =
    createFormFieldHelpers<PhoneFormValue>(t, isNew);
  const ariaLabels = createActionAriaLabels(dataType, inputValue, t);

  if (isEditing) {
    const countryCallingCodes = getMemoizedCountryCallingCodes(
      getLanguageCode(i18n.languages[0])
    );
    const { countryCallingCode } = splitNumberAndCountryCallingCode(inputValue);
    const initialCountryCallingCodeOption = countryCallingCodes.find(
      (option) => option.value === countryCallingCode
    ) as Option;

    const defaultCountryCallingCodeValue = getDefaultCountryCallingCode();
    const defaultCountryCallingCodeOption = countryCallingCodes.find(
      (option) => option.value === defaultCountryCallingCodeValue
    ) as Option;

    return (
      <div
        className={classNames(
          flexBoxColumnsStyle,
          commonFormStyles['common-editor-bottom-padding']
        )}
      >
        <h3 className={headingStyle}>{title}</h3>
        <form
          onSubmit={handleSubmit(async (values) => {
            await actionHandler('save', {
              phone: `${values.countryCallingCode}${values.number}`,
            });
          })}
        >
          <FocusKeeper targetId={`${dropdownId}-input`} autoFocus>
            <div className={flexBoxColumnsStyle}>
              <div
                className={classNames(
                  containerStyle,
                  commonFormStyles['editor-form-fields']
                )}
              >
                <FormDropdown
                  className={classNames(commonFormStyles['form-field'])}
                  name={'countryCallingCode'}
                  id={dropdownId}
                  label={t('profileForm.countryCallingCode')}
                  options={countryCallingCodes}
                  defaultOption={defaultCountryCallingCodeOption}
                  disabled={!!saving}
                  invalid={hasFieldError(formState, 'countryCallingCode')}
                  error={(
                    getFieldErrorMessage(formState, 'countryCallingCode') ?? ''
                  ).toString()}
                  aria-describedby={`${dataType}-countryCallingCode-helper`}
                  onChange={(clickedOption: Option) => {
                    setValue(
                      'countryCallingCode',
                      clickedOption ? clickedOption.value : '',
                      { shouldValidate: true, shouldDirty: true }
                    );
                  }}
                  allowSearch
                  virtualized
                  initialOption={initialCountryCallingCodeOption}
                />
                <Controller
                  name="number"
                  control={control}
                  render={({
                    field: { onChange, value: fieldValue, ...field },
                  }) => (
                    <PhoneInput
                      {...field}
                      value={fieldValue}
                      className={commonFormStyles['form-field']}
                      id={inputId}
                      maxLength={formFields.number.max}
                      invalid={hasFieldError(formState, 'number')}
                      aria-invalid={hasFieldError(formState, 'number')}
                      errorText={getFieldErrorMessage(formState, 'number')}
                      aria-labelledby={`${dataType}-number-helper`}
                      disabled={!!saving}
                      label={t('profileForm.phone')}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        onChange(event.target.value.replace(/\D/g, ''));
                      }}
                    />
                  )}
                />
              </div>
              <AccessibleFormErrors
                formState={
                  formState as {
                    errors: Record<string, { message?: string }>;
                    submitCount: number;
                  }
                }
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
        </form>
      </div>
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
