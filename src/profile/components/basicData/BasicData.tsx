import React from 'react';
import { useTranslation } from 'react-i18next';
import { Field, Formik, FormikProps, Form } from 'formik';
import { TextInput } from 'hds-react';

import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import { getFormFields } from '../../helpers/formProperties';
import { basicDataType, BasicDataValue } from '../../helpers/editData';
import { saveTypeToAction } from '../../hooks/useProfileDataEditor';
import { basicDataSchema } from '../../../common/schemas/schemas';
import { createFormFieldHelpers } from '../../helpers/formik';
import EditingNotifications from '../editingNotifications/EditingNotifications';
import EditButtons from '../editButtons/EditButtons';
import FormButtons from '../formButtons/FormButtons';
import SaveIndicator from '../saveIndicator/SaveIndicator';
import createActionAriaLabels from '../../helpers/createActionAriaLabels';
import FocusKeeper from '../../../common/focusKeeper/FocusKeeper';
import AccessibleFormikErrors from '../accessibleFormikErrors/AccessibleFormikErrors';
import AccessibilityFieldHelpers from '../../../common/accessibilityFieldHelpers/AccessibilityFieldHelpers';
import { RequiredFieldsNote } from '../../../common/requiredFieldsNote/RequiredFieldsNote';
import { useCommonEditHandling } from '../../hooks/useCommonEditHandling';

type FormikValues = BasicDataValue;

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

  if (!hasData()) {
    return null;
  }
  const { value, saving } = getData();
  const { firstName, nickname, lastName } = value as BasicDataValue;
  const formFields = getFormFields(basicDataType);

  const { hasFieldError, getFieldErrorMessage } = createFormFieldHelpers<
    FormikValues
  >(t, true);

  const ariaLabels = createActionAriaLabels(basicDataType, '', t);

  const formFieldStyle = commonFormStyles['form-field'];
  if (isEditing) {
    return (
      <Formik
        initialValues={{ firstName, nickname, lastName }}
        onSubmit={async values => actionHandler('save', values)}
        validationSchema={basicDataSchema}
      >
        {(formikProps: FormikProps<FormikValues>) => (
          <ProfileSection>
            <h2 className={commonFormStyles['section-title']}>
              {t('profileForm.basicData')}
            </h2>
            <RequiredFieldsNote />
            <Form>
              <FocusKeeper targetId={`${basicDataType}-firstName`}>
                <div className={commonFormStyles['multi-item-wrapper']}>
                  <Field
                    className={formFieldStyle}
                    name="firstName"
                    id={`${basicDataType}-firstName`}
                    maxLength={formFields.firstName.max as number}
                    as={TextInput}
                    invalid={hasFieldError(formikProps, 'firstName')}
                    aria-invalid={hasFieldError(formikProps, 'firstName')}
                    errorText={getFieldErrorMessage(formikProps, 'firstName')}
                    label={`${t(formFields.firstName.translationKey)} *`}
                    aria-labelledby="basic-data-firstName-helper"
                    autoFocus
                  />
                  <Field
                    className={formFieldStyle}
                    name="nickname"
                    id={`${basicDataType}-nickname`}
                    maxLength={formFields.nickname.max as number}
                    as={TextInput}
                    invalid={hasFieldError(formikProps, 'nickname')}
                    aria-invalid={hasFieldError(formikProps, 'nickname')}
                    errorText={getFieldErrorMessage(formikProps, 'nickname')}
                    label={t(formFields.nickname.translationKey)}
                    aria-labelledby="basic-data-nickname-helper"
                  />
                  <Field
                    className={formFieldStyle}
                    name="lastName"
                    id={`${basicDataType}-lastName`}
                    maxLength={formFields.lastName.max as number}
                    as={TextInput}
                    invalid={hasFieldError(formikProps, 'lastName')}
                    aria-invalid={hasFieldError(formikProps, 'lastName')}
                    errorText={getFieldErrorMessage(formikProps, 'lastName')}
                    label={`${t(formFields.lastName.translationKey)} *`}
                    aria-labelledby={`${basicDataType}-lastName-helper`}
                  />
                </div>
                <AccessibilityFieldHelpers dataType={basicDataType} />
                <AccessibleFormikErrors
                  formikProps={formikProps}
                  dataType={basicDataType}
                />
                <EditingNotifications
                  content={content}
                  dataType={basicDataType}
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
            </Form>
          </ProfileSection>
        )}
      </Formik>
    );
  }

  return (
    <ProfileSection>
      <div className={commonFormStyles['content-wrapper']}>
        <h2 className={commonFormStyles['section-title']}>
          {t('profileForm.basicData')}
        </h2>
        <div className={commonFormStyles['multi-item-wrapper']}>
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
