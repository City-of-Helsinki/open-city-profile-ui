import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Field, Formik, FormikProps, Form } from 'formik';
import { Button, IconPlusCircle, TextInput, Notification } from 'hds-react';
import to from 'await-to-js';
import _ from 'lodash';

import styles from './emailEditor.module.css';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import { getFormFields } from '../../helpers/formProperties';
import {
  EditDataType,
  EditDataValue,
  EmailValue,
  getEmailEditDataForUI,
  isNewItem,
} from '../../helpers/editData';
import {
  saveTypeToAction,
  useProfileDataEditor,
} from '../../hooks/useProfileDataEditor';
import { emailSchema } from '../../../common/schemas/schemas';
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
import { AnyObject } from '../../../graphql/typings';

function EmailEditor(): React.ReactElement | null {
  const dataType: EditDataType = 'emails';
  const [isEditing, setEditing] = useState(false);
  const [showVerifyEmailInfo, setShowVerifyEmailInfo] = useState(false);
  const { t } = useTranslation();
  const {
    content,
    setErrorMessage,
    setSuccessMessage,
    clearMessage,
  } = useNotificationContent();
  const { editDataList, save, reset, add, remove } = useProfileDataEditor({
    dataType,
  });
  const [editButtonId, setFocusToEditButton] = useFocusSetter({
    targetId: `${dataType}-edit-button`,
  });
  const editData = getEmailEditDataForUI(editDataList);
  const { value, saving } = editData;
  const { email } = value as EmailValue;
  const formFields = getFormFields(dataType);
  const ariaLabels = createActionAriaLabels(dataType, email, t);

  const { hasFieldError, getFieldErrorMessage } = createFormFieldHelpers<
    EmailValue
  >(t, true);

  const actionHandler: ActionHandler = async (action, newValue) => {
    clearMessage();
    if (action === 'save') {
      if (_.isMatch(newValue as AnyObject, editData.value)) {
        setFocusToEditButton();
        setEditing(false);
        return Promise.resolve();
      }
      const [error] = await to(save(editData, newValue as EditDataValue));
      if (error) {
        setErrorMessage('save');
      } else {
        setFocusToEditButton();
        setSuccessMessage('save');
        setEditing(false);
        setShowVerifyEmailInfo(true);
      }
    }
    if (action === 'cancel') {
      if (isNewItem(editData)) {
        await remove(editData);
      } else {
        reset(editData);
      }
      setFocusToEditButton();
      setEditing(false);
    }
    if (action === 'edit') {
      setEditing(true);
    }
    return Promise.resolve();
  };

  if (isEditing) {
    return (
      <Formik
        initialValues={{ email }}
        onSubmit={async values => actionHandler('save', values)}
        validationSchema={emailSchema}
      >
        {(formikProps: FormikProps<EmailValue>) => (
          <ProfileSection>
            <h3 className={commonFormStyles['section-title']}>
              {t('profileForm.email')}
            </h3>
            <div className={commonFormStyles['content-wrapper']}>
              <Form>
                <FocusKeeper targetId={`${dataType}-email`}>
                  <div className={styles['form-content-wrapper']}>
                    <Field
                      name="email"
                      id={`${dataType}-email`}
                      maxLength={formFields.email.max as number}
                      as={TextInput}
                      invalid={hasFieldError(formikProps, 'email')}
                      aria-invalid={hasFieldError(formikProps, 'email')}
                      errorText={getFieldErrorMessage(formikProps, 'email')}
                      aria-labelledby={`${dataType}-email-helper`}
                      autoFocus
                      className={styles['form-field']}
                    />
                    <AccessibilityFieldHelpers dataType={dataType} />
                    <AccessibleFormikErrors
                      formikProps={formikProps}
                      dataType={dataType}
                    />
                    <EditingNotifications
                      content={content}
                      dataType={dataType}
                    />
                    <FormButtons
                      handler={actionHandler}
                      disabled={!!saving}
                      alignLeft
                      testId={dataType}
                    />
                  </div>
                  <SaveIndicator
                    action={saveTypeToAction(saving)}
                    testId={dataType}
                  />
                </FocusKeeper>
              </Form>
            </div>
          </ProfileSection>
        )}
      </Formik>
    );
  }

  return (
    <ProfileSection>
      <div className={commonFormStyles['content-wrapper']}>
        <h3 className={commonFormStyles['section-title']}>
          {t('profileForm.email')}
        </h3>
        <div className={styles['text-content-wrapper']}>
          <span
            className={commonFormStyles['value']}
            data-testid={`${dataType}-email`}
          >
            {email || t('profileInformation.noEmail')}
          </span>
        </div>
        {email && (
          <div className={commonFormStyles['actions-wrapper']}>
            <EditButtons
              handler={actionHandler}
              actions={{
                removable: false,
                setPrimary: false,
              }}
              buttonClassNames={commonFormStyles['actions-wrapper-button']}
              editButtonId={editButtonId}
              testId={dataType}
              ariaLabels={ariaLabels}
            />
          </div>
        )}
      </div>
      {showVerifyEmailInfo && (
        <div className={styles['notification-wrapper']}>
          <Notification
            type={'info'}
            label={t('profileInformation.verifyEmailTitle')}
            dataTestId={'verify-email-notification'}
          >
            {t('profileInformation.verifyEmailText')}
          </Notification>
        </div>
      )}
      {!email && (
        <Button
          iconLeft={<IconPlusCircle />}
          onClick={async () => {
            clearMessage();
            add();
            setEditing(true);
          }}
          data-testid={`${dataType}-add-button`}
          variant="secondary"
          className={commonFormStyles['responsive-button']}
        >
          {t('profileForm.addEmail')}
        </Button>
      )}
    </ProfileSection>
  );
}

export default EmailEditor;
