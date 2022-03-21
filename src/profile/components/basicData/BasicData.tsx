import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Field, Formik, FormikProps, Form } from 'formik';
import { TextInput } from 'hds-react';
import to from 'await-to-js';

import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import { getFormFields } from '../../helpers/formProperties';
import {
  basicDataType,
  BasicDataValue,
  EditDataValue,
} from '../../helpers/editData';
import {
  ActionListener,
  saveTypeToAction,
  useProfileDataEditor,
} from '../../hooks/useProfileDataEditor';
import { basicDataSchema } from '../../../common/schemas/schemas';
import { createFormFieldHelpers } from '../../helpers/formik';
import useNotificationContent from '../editingNotifications/useNotificationContent';
import EditingNotifications from '../editingNotifications/EditingNotifications';
import EditButtons, { ActionHandler } from '../editButtons/EditButtons';
import FormButtons from '../formButtons/FormButtons';
import SaveIndicator from '../saveIndicator/SaveIndicator';
import { useFocusSetter } from '../../hooks/useFocusSetter';
import createActionAriaLabels from '../../helpers/createActionAriaLabels';
import FocusKeeper from '../../../common/focusKeeper/FocusKeeper';
import AccessibleFormikErrors from '../accessibleFormikErrors/AccessibleFormikErrors';
import AccessibilityFieldHelpers from '../../../common/accessibilityFieldHelpers/AccessibilityFieldHelpers';
import { RequiredFieldsNote } from '../../../common/requiredFieldsNote/RequiredFieldsNote';

type FormikValues = BasicDataValue;

function BasicData(): React.ReactElement | null {
  const [isEditing, setEditing] = useState(false);
  const { t } = useTranslation();
  const {
    content,
    setErrorMessage,
    setSuccessMessage,
    clearMessage,
  } = useNotificationContent();

  const { editDataList, save, reset } = useProfileDataEditor({
    dataType: basicDataType,
  });

  const [editButtonId, setFocusToEditButton] = useFocusSetter({
    targetId: `${basicDataType}-edit-button`,
  });

  if (!editDataList || !editDataList[0]) {
    return null;
  }
  const editData = editDataList[0];
  const { value, saving } = editData;
  const { firstName, nickname, lastName } = value as BasicDataValue;
  const formFields = getFormFields(basicDataType);

  const { hasFieldError, getFieldErrorMessage } = createFormFieldHelpers<
    FormikValues
  >(t, true);

  const ariaLabels = createActionAriaLabels(basicDataType, '', t);

  const onAction: ActionListener = async (action, item, newValue) => {
    clearMessage();
    if (action === 'save') {
      return save(item, newValue as EditDataValue);
    }
    return Promise.resolve();
  };

  const actionHandler: ActionHandler = async action => {
    const promise = await onAction(action, editData);
    if (action === 'cancel') {
      setFocusToEditButton();
      reset(editData);
      setEditing(false);
    }
    if (action === 'edit') {
      clearMessage();
      setEditing(true);
    }
    return promise;
  };
  const formFieldStyle = commonFormStyles['form-field'];
  if (isEditing) {
    return (
      <Formik
        initialValues={{ firstName, nickname, lastName }}
        onSubmit={async values => {
          const [error] = await to(onAction('save', editData, values));
          if (error) {
            setErrorMessage('save');
          } else {
            setFocusToEditButton();
            setSuccessMessage('save');
            setEditing(false);
          }
        }}
        validationSchema={basicDataSchema}
      >
        {(formikProps: FormikProps<FormikValues>) => (
          <ProfileSection>
            <h3 className={commonFormStyles['section-title']}>
              {t('profileForm.basicData')}
            </h3>
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
                  alignLeft
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
        <h3 className={commonFormStyles['section-title']}>
          {t('profileForm.basicData')}
        </h3>
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
        <div className={commonFormStyles['actions-wrapper']}>
          <EditButtons
            handler={actionHandler}
            actions={{
              removable: false,
              setPrimary: false,
            }}
            buttonClassNames={commonFormStyles['actions-wrapper-button']}
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
