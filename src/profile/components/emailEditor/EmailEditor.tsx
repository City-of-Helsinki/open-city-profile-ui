import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Field, Formik, FormikProps, Form } from 'formik';
import { TextInput, Notification } from 'hds-react';
import _ from 'lodash';

import styles from './emailEditor.module.css';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import { getFormFields } from '../../helpers/formProperties';
import {
  EditDataType,
  EmailValue,
  getEmailEditDataForUI,
} from '../../helpers/editData';
import { saveTypeToAction } from '../../hooks/useProfileDataEditor';
import { emailSchema } from '../../../common/schemas/schemas';
import { createFormFieldHelpers } from '../../helpers/formik';
import EditingNotifications from '../editingNotifications/EditingNotifications';
import EditButtons, { ActionHandler } from '../editButtons/EditButtons';
import FormButtons from '../formButtons/FormButtons';
import SaveIndicator from '../saveIndicator/SaveIndicator';
import createActionAriaLabels from '../../helpers/createActionAriaLabels';
import FocusKeeper from '../../../common/focusKeeper/FocusKeeper';
import AccessibleFormikErrors from '../accessibleFormikErrors/AccessibleFormikErrors';
import AccessibilityFieldHelpers from '../../../common/accessibilityFieldHelpers/AccessibilityFieldHelpers';
import { AnyObject } from '../../../graphql/typings';
import useProfile from '../../../auth/useProfile';
import { hasTunnistusSuomiFiAmr } from '../profileInformation/authenticationProviderUtil';
import { useCommonEditHandling } from '../../hooks/useCommonEditHandling';
import AddButton from '../multiItemEditor/AddButton';

function EmailEditor(): React.ReactElement | null {
  const dataType: EditDataType = 'emails';
  const [showVerifyEmailInfo, setShowVerifyEmailInfo] = useState(false);
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

  const editData = getEmailEditDataForUI(hasData() ? [getData()] : []);
  const { value, saving } = editData;
  const { email } = value as EmailValue;
  const formFields = getFormFields(dataType);
  const ariaLabels = createActionAriaLabels(dataType, email, t);
  const { profile } = useProfile();
  const willSendEmailVerificationCode = hasTunnistusSuomiFiAmr(profile);
  const { hasFieldError, getFieldErrorMessage } = createFormFieldHelpers<
    EmailValue
  >(t, true);
  const actionChecker: ActionHandler = async (action, newValue) => {
    if (action === 'save') {
      if (_.isMatch(newValue as AnyObject, editData.value)) {
        return actionHandler('cancel');
      }
      const success = await actionHandler('save', newValue);
      if (success && willSendEmailVerificationCode) {
        setShowVerifyEmailInfo(true);
      }
    }
    if (action === 'cancel') {
      return actionHandler('cancel');
    }
    if (action === 'edit') {
      return actionHandler('edit');
    }
    return Promise.resolve();
  };

  if (isEditing) {
    return (
      <Formik
        initialValues={{ email }}
        onSubmit={async values => actionChecker('save', values)}
        validationSchema={emailSchema}
      >
        {(formikProps: FormikProps<EmailValue>) => (
          <div>
            <h3 className={commonFormStyles['label-size']}>
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
                      handler={actionChecker}
                      disabled={!!saving}
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
          </div>
        )}
      </Formik>
    );
  }

  return (
    <div>
      <div className={commonFormStyles['content-wrapper']}>
        <h3 className={commonFormStyles['label-size']}>
          {t('profileForm.email')}
        </h3>
        <div className={commonFormStyles['text-content-wrapper']}>
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
              handler={actionChecker}
              actions={{
                removable: false,
                setPrimary: false,
              }}
              buttonClassNames={commonFormStyles['profile-button']}
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
      {!email && <AddButton editHandler={editHandler} />}
      {!willSendEmailVerificationCode && (
        <EditingNotifications content={content} dataType={dataType} />
      )}
    </div>
  );
}

export default EmailEditor;
