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
import { getFieldError, getIsInvalid } from '../../helpers/formik';
import useNotificationContent from '../editingNotifications/useNotificationContent';
import EditingNotifications from '../editingNotifications/EditingNotifications';
import EditButtons, { ActionHandler } from '../editButtons/EditButtons';
import FormButtons from '../formButtons/FormButtons';
import SaveIndicator from '../saveIndicator/SaveIndicator';

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
  const testId = basicDataType;

  const { editDataList, save, reset } = useProfileDataEditor({
    dataType: basicDataType,
  });

  if (!editDataList || !editDataList[0]) {
    return null;
  }
  const editData = editDataList[0];
  const { value, saving } = editData;
  const { firstName, nickname, lastName } = value as BasicDataValue;
  const formFields = getFormFields(basicDataType);

  const hasFieldError = (
    formikProps: FormikProps<FormikValues>,
    fieldName: keyof FormikValues
  ): boolean => getIsInvalid<FormikValues>(formikProps, fieldName, true);

  const getFieldErrorMessage = (
    formikProps: FormikProps<FormikValues>,
    fieldName: keyof FormikValues
  ) => {
    if (!hasFieldError(formikProps, fieldName)) {
      return undefined;
    }
    return getFieldError<FormikValues>(t, formikProps, fieldName, true);
  };

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
      reset(editData);
      setEditing(false);
    }
    if (action === 'edit') {
      clearMessage();
      setEditing(true);
    }
    return promise;
  };

  if (isEditing) {
    return (
      <Formik
        initialValues={{ firstName, nickname, lastName }}
        onSubmit={async values => {
          const [error] = await to(onAction('save', editData, values));
          if (error) {
            setErrorMessage('save');
          } else {
            setSuccessMessage('save');
            setEditing(false);
          }
        }}
        validationSchema={basicDataSchema}
      >
        {(formikProps: FormikProps<FormikValues>) => (
          <ProfileSection>
            <h3 className={commonFormStyles.sectionTitle}>
              {t('profileForm.basicData')}
            </h3>
            <Form>
              <div className={commonFormStyles.multiItemWrapper}>
                <Field
                  className={commonFormStyles.formField}
                  name="firstName"
                  id={`${testId}-firstName`}
                  maxLength={formFields.firstName.max as number}
                  as={TextInput}
                  invalid={hasFieldError(formikProps, 'firstName')}
                  aria-invalid={hasFieldError(formikProps, 'firstName')}
                  helperText={getFieldErrorMessage(formikProps, 'firstName')}
                  labelText={t(formFields.firstName.translationKey)}
                  aria-labelledby="basic-data-firstName-helper"
                  autoFocus
                />
                <Field
                  className={commonFormStyles.formField}
                  name="nickname"
                  id={`${testId}-nickname`}
                  maxLength={formFields.nickname.max as number}
                  as={TextInput}
                  invalid={hasFieldError(formikProps, 'nickname')}
                  aria-invalid={hasFieldError(formikProps, 'nickname')}
                  helperText={getFieldErrorMessage(formikProps, 'nickname')}
                  labelText={t(formFields.nickname.translationKey)}
                  aria-labelledby="basic-data-nickname-helper"
                />
                <Field
                  className={commonFormStyles.formField}
                  name="lastName"
                  id={`${testId}-lastName`}
                  maxLength={formFields.lastName.max as number}
                  as={TextInput}
                  invalid={hasFieldError(formikProps, 'lastName')}
                  aria-invalid={hasFieldError(formikProps, 'lastName')}
                  helperText={getFieldErrorMessage(formikProps, 'lastName')}
                  labelText={t(formFields.lastName.translationKey)}
                  aria-labelledby={`${basicDataType}-lastName-helper`}
                />
              </div>
              <EditingNotifications
                content={content}
                dataType={basicDataType}
              />
              <FormButtons
                handler={actionHandler}
                disabled={!!saving}
                alignLeft
                testId={testId}
              />
              <SaveIndicator
                action={saveTypeToAction(saving)}
                testId={testId}
              />
            </Form>
          </ProfileSection>
        )}
      </Formik>
    );
  }

  return (
    <ProfileSection>
      <div className={commonFormStyles.contentWrapper}>
        <h3 className={commonFormStyles.sectionTitle}>
          {t('profileForm.basicData')}
        </h3>
        <div className={commonFormStyles.multiItemWrapper}>
          <LabeledValue
            label={t(formFields.firstName.translationKey)}
            value={firstName}
            testId={`${testId}-firstName`}
          />
          <LabeledValue
            label={t(formFields.nickname.translationKey)}
            value={nickname}
            testId={`${testId}-nickname`}
          />
          <LabeledValue
            label={t(formFields.lastName.translationKey)}
            value={lastName}
            testId={`${testId}-lastName`}
          />
        </div>
        <div className={commonFormStyles.actionsWrapper}>
          <EditButtons
            handler={actionHandler}
            actions={{
              removable: false,
              setPrimary: false,
            }}
            buttonClassNames={commonFormStyles.actionsWrapperButton}
            editButtonId={`${basicDataType}-edit-button`}
            testId={testId}
          />
        </div>
      </div>
      <EditingNotifications content={content} dataType={basicDataType} />
    </ProfileSection>
  );
}

export default BasicData;
