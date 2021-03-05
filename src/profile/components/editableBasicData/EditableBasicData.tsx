import { TextInput } from 'hds-react';
import React, { useState } from 'react';
import { Field, Formik, FormikProps, Form } from 'formik';
import { useTranslation } from 'react-i18next';
import { useMatomo } from '@datapunt/matomo-tracker-react';

import to from '../../../common/awaitTo';
import { useProfileMutationHandler } from '../../helpers/hooks';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import {
  ActionListener,
  EditableUserData,
  basicDataType,
  resetValue,
  Action,
} from '../../helpers/mutationEditor';
import { getFieldError, getIsInvalid } from '../../helpers/formik';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import FocusKeeper from '../../../common/focusKeeper/FocusKeeper';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import useNotificationContent from '../editingNotifications/useNotificationContent';
import EditingNotifications from '../editingNotifications/EditingNotifications';
import { basicDataSchema } from '../../../common/schemas/schemas';
import Actions, {
  ActionAriaLabels,
  ActionHandler,
} from '../editableRow/Actions';
import EditButtons from '../editableRow/EditButtons';
import AccessibleFormikErrors from '../accessibleFormikErrors/AccessibleFormikErrors';
import createActionAriaLabels from '../../helpers/createActionAriaLabels';
import { useAutoFocus } from '../../helpers/useAutoFocus';
import AccessibilityFieldHelpers from '../../../common/accessibilityFieldHelpers/AccessibilityFieldHelpers';
import { getFormFields } from '../../helpers/formProperties';
import SaveIndicator from '../saveIndicator/SaveIndicator';

type FormikValues = EditableUserData;

function EditableBasicData(): React.ReactElement | null {
  const { data, save } = useProfileMutationHandler({
    dataType: basicDataType,
  });
  const {
    content,
    setErrorMessage,
    setSuccessMessage,
    clearMessage,
  } = useNotificationContent();
  const [isEditing, setEditing] = useState(false);
  const [currentSaveAction, setCurrentSaveAction] = useState<
    Action | undefined
  >(undefined);
  const { t } = useTranslation();
  const { trackEvent } = useMatomo();
  const { autoFocusTargetId, activateAutoFocusing } = useAutoFocus({
    targetId: 'basic-data-edit-button',
  });

  if (!data || !data[0]) {
    return null;
  }
  const editData = data[0];
  const { value, editable } = editData;
  const { firstName, nickname, lastName } = value as EditableUserData;
  const formFields = getFormFields(basicDataType);

  const onAction: ActionListener = async (action, item) => {
    trackEvent({ category: 'form-action', action });
    clearMessage();
    if (action === 'save') {
      return save(item);
    }
    return Promise.resolve();
  };

  const actionHandler: ActionHandler = async action => {
    const promise = await onAction(action, editData);
    if (action === 'cancel') {
      resetValue(editData);
      activateAutoFocusing();
      setEditing(false);
    }
    if (action === 'edit') {
      clearMessage();
      setEditing(true);
    }
    return promise;
  };

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

  const ariaActionLabels: ActionAriaLabels = createActionAriaLabels(
    editData,
    t
  );

  if (isEditing) {
    return (
      <Formik
        initialValues={{ firstName, nickname, lastName }}
        onSubmit={async (values, actions) => {
          actions.setSubmitting(true);
          setCurrentSaveAction('save');
          // eslint-disable-next-line no-shadow
          const { firstName, nickname, lastName } = values;
          editData.value = { firstName, nickname, lastName };
          const [error] = await to(onAction('save', editData));
          actions.setSubmitting(false);
          setCurrentSaveAction(undefined);
          if (error) {
            setErrorMessage('', 'save');
          } else {
            setSuccessMessage('', 'save');
            activateAutoFocusing();
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
              <FocusKeeper targetId={'firstName'}>
                <div className={commonFormStyles.multiItemWrapper}>
                  <Field
                    className={commonFormStyles.formField}
                    name="firstName"
                    id="firstName"
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
                    id="nickname"
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
                    id="lastName"
                    maxLength={formFields.lastName.max as number}
                    as={TextInput}
                    invalid={hasFieldError(formikProps, 'lastName')}
                    aria-invalid={hasFieldError(formikProps, 'lastName')}
                    helperText={getFieldErrorMessage(formikProps, 'lastName')}
                    labelText={t(formFields.lastName.translationKey)}
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
                <EditButtons
                  handler={actionHandler}
                  canSubmit={!!editable && !Boolean(formikProps.isSubmitting)}
                  alignLeft
                />
              </FocusKeeper>
              <SaveIndicator currentAction={currentSaveAction} />
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
          />
          <LabeledValue
            label={t(formFields.nickname.translationKey)}
            value={nickname}
          />
          <LabeledValue
            label={t(formFields.lastName.translationKey)}
            value={lastName}
          />
        </div>

        <div className={commonFormStyles.actionsWrapper}>
          <Actions
            handler={actionHandler}
            actions={{
              editable: true,
              removable: false,
              setPrimary: false,
            }}
            buttonClassNames={commonFormStyles.actionsWrapperButton}
            ariaLabels={ariaActionLabels}
            editButtonId={autoFocusTargetId}
          />
        </div>
      </div>
      <EditingNotifications content={content} dataType={basicDataType} />
    </ProfileSection>
  );
}

export default EditableBasicData;
