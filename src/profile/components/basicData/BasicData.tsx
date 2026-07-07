import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { TextInput } from 'hds-react';
import classNames from 'classnames';

import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import { getFormFields } from '../../helpers/formProperties';
import { basicDataType, BasicDataValue } from '../../helpers/editData';
import { saveTypeToAction } from '../../hooks/useProfileDataEditor';
import { basicDataSchema } from '../../../common/schemas/schemas';
import { createFormFieldHelpers } from '../../helpers/formFields';
import EditingNotifications from '../editingNotifications/EditingNotifications';
import EditButtons from '../editButtons/EditButtons';
import FormButtons from '../formButtons/FormButtons';
import SaveIndicator from '../saveIndicator/SaveIndicator';
import createActionAriaLabels from '../../helpers/createActionAriaLabels';
import FocusKeeper from '../../../common/focusKeeper/FocusKeeper';
import AccessibleFormErrors from '../accessibleFormErrors/AccessibleFormErrors';
import AccessibilityFieldHelpers from '../../../common/accessibilityFieldHelpers/AccessibilityFieldHelpers';
import { RequiredFieldsNote } from '../../../common/requiredFieldsNote/RequiredFieldsNote';
import { useCommonEditHandling } from '../../hooks/useCommonEditHandling';

type FormValues = BasicDataValue;

function BasicData(): React.ReactElement | null {
  const dataType = basicDataType;
  const { t } = useTranslation();

  const editHandler = useCommonEditHandling({
    dataType,
    disableEditButtons: false,
  });

  const {
    notificationContent,
    actionHandler,
    getData,
    hasData,
    editButtonId,
    isEditing,
  } = editHandler;

  const { content } = notificationContent;

  const formFields = getFormFields(basicDataType);
  const { hasFieldError, getFieldErrorMessage } =
    createFormFieldHelpers<FormValues>(t, true);
  const ariaLabels = createActionAriaLabels(basicDataType, '', t);
  const formFieldStyle = commonFormStyles['form-field'];
  const containerStyle = commonFormStyles['responsive-flex-box-columns-rows'];

  // Pre-compute values with safe defaults for unconditional hook initialization
  const existingData = hasData() ? (getData().value as BasicDataValue) : null;
  const { register, handleSubmit, formState, reset } = useForm<FormValues>({
    defaultValues: {
      firstName: existingData?.firstName ?? '',
      nickname: existingData?.nickname ?? '',
      lastName: existingData?.lastName ?? '',
    },
    resolver: yupResolver(basicDataSchema) as unknown as Resolver<FormValues>,
  });

  useEffect(() => {
    if (isEditing && hasData()) {
      reset(getData().value as BasicDataValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  if (!hasData()) {
    return null;
  }
  const { value, saving } = getData();
  const { firstName, nickname, lastName } = value as BasicDataValue;

  if (isEditing) {
    return (
      <ProfileSection>
        <div className={commonFormStyles['editor-description-container']}>
          <h2>{t('profileForm.basicData')}</h2>
        </div>
        <RequiredFieldsNote />
        <form
          onSubmit={handleSubmit(async (values) =>
            actionHandler('save', values)
          )}
        >
          <FocusKeeper targetId={`${basicDataType}-firstName`}>
            <div
              className={classNames(
                containerStyle,
                commonFormStyles['editor-form-fields']
              )}
            >
              <TextInput
                {...register('firstName')}
                className={formFieldStyle}
                id={`${basicDataType}-firstName`}
                maxLength={formFields.firstName.max}
                invalid={hasFieldError(formState, 'firstName')}
                aria-invalid={hasFieldError(formState, 'firstName')}
                errorText={getFieldErrorMessage(formState, 'firstName')}
                label={`${t(formFields.firstName.translationKey)} *`}
                aria-labelledby="basic-data-firstName-helper"
                autoFocus
              />
              <TextInput
                {...register('nickname')}
                className={formFieldStyle}
                id={`${basicDataType}-nickname`}
                maxLength={formFields.nickname.max}
                invalid={hasFieldError(formState, 'nickname')}
                aria-invalid={hasFieldError(formState, 'nickname')}
                errorText={getFieldErrorMessage(formState, 'nickname')}
                label={t(formFields.nickname.translationKey)}
                aria-labelledby="basic-data-nickname-helper"
              />
              <TextInput
                {...register('lastName')}
                className={formFieldStyle}
                id={`${basicDataType}-lastName`}
                maxLength={formFields.lastName.max}
                invalid={hasFieldError(formState, 'lastName')}
                aria-invalid={hasFieldError(formState, 'lastName')}
                errorText={getFieldErrorMessage(formState, 'lastName')}
                label={`${t(formFields.lastName.translationKey)} *`}
                aria-labelledby={`${basicDataType}-lastName-helper`}
              />
            </div>
            <AccessibilityFieldHelpers dataType={basicDataType} />
            <AccessibleFormErrors
              formState={
                formState as {
                  errors: Record<string, { message?: string }>;
                  submitCount: number;
                }
              }
              dataType={basicDataType}
            />
            <EditingNotifications
              content={content}
              dataType={basicDataType}
              noSpacing
              topSpacingMobile
            />
            <FormButtons
              handler={actionHandler}
              disabled={!!saving}
              testId={basicDataType}
            />
            <SaveIndicator
              action={saveTypeToAction(saving)}
              testId={basicDataType}
            />
          </FocusKeeper>
        </form>
      </ProfileSection>
    );
  }

  return (
    <ProfileSection>
      <div className={commonFormStyles['editor-description-container']}>
        <h2>{t('profileForm.basicData')}</h2>
      </div>
      <div className={classNames(containerStyle)}>
        <div
          className={classNames(
            containerStyle,
            commonFormStyles['editor-text-fields']
          )}
        >
          <LabeledValue
            label={t(formFields.firstName.translationKey)}
            value={firstName}
            testId={`${basicDataType}-firstName`}
          />
          <LabeledValue
            label={t(formFields.nickname.translationKey)}
            value={nickname}
            testId={`${basicDataType}-nickname`}
          />
          <LabeledValue
            label={t(formFields.lastName.translationKey)}
            value={lastName}
            testId={`${basicDataType}-lastName`}
          />
        </div>
        <div className={commonFormStyles['edit-buttons']}>
          <EditButtons
            handler={actionHandler}
            actions={{
              removable: false,
              setPrimary: false,
            }}
            editButtonId={editButtonId}
            testId={basicDataType}
            ariaLabels={ariaLabels}
          />
        </div>
      </div>
      <EditingNotifications content={content} dataType={basicDataType} />
    </ProfileSection>
  );
}

export default BasicData;
