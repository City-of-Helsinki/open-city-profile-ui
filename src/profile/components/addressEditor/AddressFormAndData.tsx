import { TextInput, Option } from 'hds-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import countries from 'i18n-iso-countries';
import classNames from 'classnames';

import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import { AddressValue } from '../../helpers/editData';
import { createFormFieldHelpers } from '../../helpers/formFields';
import { addressSchema } from '../../../common/schemas/schemas';
import FormButtons from '../formButtons/FormButtons';
import EditButtons from '../editButtons/EditButtons';
import FormDropdown from '../../../common/formDropdown/FormDropdown';
import getLanguageCode from '../../../common/helpers/getLanguageCode';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import getCountry from '../../helpers/getCountry';
import { getFormFields } from '../../helpers/formProperties';
import SaveIndicator from '../saveIndicator/SaveIndicator';
import { EditHandling } from '../../hooks/useCommonEditHandling';
import createActionAriaLabels from '../../helpers/createActionAriaLabels';
import FocusKeeper from '../../../common/focusKeeper/FocusKeeper';
import AccessibleFormErrors from '../accessibleFormErrors/AccessibleFormErrors';
import { RequiredFieldsNote } from '../../../common/requiredFieldsNote/RequiredFieldsNote';
import { useVerifiedPersonalInformation } from '../../context/ProfileContext';
import AddButton from '../addButton/AddButton';
import EditingNotifications from '../editingNotifications/EditingNotifications';

type FormValues = AddressValue;

function AddressFormAndData({
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
  const userIsVerified = !!useVerifiedPersonalInformation();
  const title = userIsVerified
    ? t('profileInformation.addressTitleWhenHasVerifiedData')
    : t('profileInformation.address');

  const description = userIsVerified
    ? t('profileInformation.addressDescriptionNoWeakAddress')
    : t('profileInformation.addressDescriptionNoAddress');
  const containerStyle = commonFormStyles['responsive-flex-box-columns-rows'];

  // Pre-compute initial values so hooks can be called unconditionally
  const existingValue = hasData() ? (getData().value as AddressValue) : null;
  const initialAddress = existingValue?.address ?? '';
  const initialCity = existingValue?.city ?? '';
  const initialPostalCode = existingValue?.postalCode ?? '';
  const initialCountryCode = existingValue?.countryCode ?? '';

  const { handleSubmit, formState, setValue, reset, register } =
    useForm<FormValues>({
      defaultValues: {
        address: initialAddress,
        city: initialCity,
        postalCode: initialPostalCode,
        countryCode: initialCountryCode,
      },
      resolver: yupResolver(addressSchema),
    });

  useEffect(() => {
    if (isEditing && hasData()) {
      reset(getData().value as AddressValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

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
        <EditingNotifications
          content={notificationContent.content}
          dataType={dataType}
        />
      </div>
    );
  }

  const data = getData();
  const value = data.value as AddressValue;
  const { countryCode } = value;
  const lang = i18n.languages[0];
  const applicationLanguage = getLanguageCode(i18n.languages[0]);
  const countryList = countries.getNames(applicationLanguage);
  const countryOptions = Object.keys(countryList)
    .map((key) => ({
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
    (option) => option.value === countryCode
  ) as Option;
  const formFields = getFormFields(dataType);

  const { hasFieldError, getFieldErrorMessage } =
    createFormFieldHelpers<FormValues>(t, isNew);

  const { primary, saving } = data;
  const disableButtons = !!currentAction || !!saving;
  const ariaLabels = createActionAriaLabels(dataType, value.address, t);
  const formFieldStyle = commonFormStyles['form-field'];

  if (isEditing) {
    return (
      <form
        onSubmit={handleSubmit(async (values) => {
          await actionHandler('save', values);
        })}
      >
        <Explanation />
        <RequiredFieldsNote />
        <FocusKeeper targetId={`${testId}-address`}>
          <div
            className={classNames(
              containerStyle,
              commonFormStyles['editor-form-fields']
            )}
          >
            <TextInput
              {...register('address')}
              id={`${testId}-address`}
              maxLength={formFields.address.max as number}
              invalid={hasFieldError(formState, 'address')}
              aria-invalid={hasFieldError(formState, 'address')}
              errorText={getFieldErrorMessage(formState, 'address')}
              label={`${t(formFields.address.translationKey)} *`}
              autoFocus
              aria-labelledby={`${dataType}-address-helper`}
              className={formFieldStyle}
            />
            <TextInput
              {...register('postalCode')}
              id={`${testId}-postalCode`}
              maxLength={formFields.postalCode.max as number}
              invalid={hasFieldError(formState, 'postalCode')}
              aria-invalid={hasFieldError(formState, 'postalCode')}
              errorText={getFieldErrorMessage(formState, 'postalCode')}
              label={`${t(formFields.postalCode.translationKey)} *`}
              aria-labelledby={`${dataType}-postalCode-helper`}
              className={formFieldStyle}
            />
            <TextInput
              {...register('city')}
              id={`${testId}-city`}
              maxLength={formFields.city.max as number}
              invalid={hasFieldError(formState, 'city')}
              aria-invalid={hasFieldError(formState, 'city')}
              errorText={getFieldErrorMessage(formState, 'city')}
              label={`${t(formFields.city.translationKey)} *`}
              aria-labelledby={`${dataType}-city-helper`}
              className={formFieldStyle}
            />
            <div className={commonFormStyles['form-field']}>
              <FormDropdown
                name="countryCode"
                id={`${testId}-countryCode`}
                options={countryOptions}
                label={`${t(formFields.countryCode.translationKey)} *`}
                defaultOption={defaultCountryOption as Option}
                invalid={hasFieldError(formState, 'countryCode')}
                error={(
                  getFieldErrorMessage(formState, 'countryCode') ?? ''
                ).toString()}
                aria-describedby={`${dataType}-countryCode-helper`}
                allowSearch
                onChange={(option: Option) =>
                  setValue('countryCode', option ? option.value : '')
                }
                initialOption={initialCountryOption}
              />
            </div>
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
          <SaveIndicator action={currentAction} testId={testId} />
        </FocusKeeper>
      </form>
    );
  }

  return (
    <div className={classNames(commonFormStyles['flex-box-columns'])}>
      <div
        className={classNames(
          commonFormStyles['editor-description-container'],
          commonFormStyles['bottom-border']
        )}
      >
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
      <EditingNotifications
        content={notificationContent.content}
        dataType={dataType}
      />
    </div>
  );
}

export default AddressFormAndData;
