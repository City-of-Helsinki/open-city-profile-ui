import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Field, Formik, FormikProps, Form } from 'formik';
import { TextInput, Notification, useOidcClient } from 'hds-react';
import classNames from 'classnames';

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
import {
  hasHelsinkiAccountAMR,
  hasTunnistusSuomiFiAmr,
} from '../profileInformation/authenticationProviderUtil';
import { useCommonEditHandling } from '../../hooks/useCommonEditHandling';
import AddButton from '../addButton/AddButton';

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
  const { getAmr } = useOidcClient();

  const editData = getEmailEditDataForUI(hasData() ? [getData()] : []);
  const { value, saving } = editData;
  const { email } = value as EmailValue;
  const formFields = getFormFields(dataType);
  const ariaLabels = createActionAriaLabels(dataType, email, t);
  const amrArray = getAmr();
  const willSendEmailVerificationCode =
    hasTunnistusSuomiFiAmr(amrArray) || hasHelsinkiAccountAMR(amrArray);
  const { hasFieldError, getFieldErrorMessage } = createFormFieldHelpers<
    EmailValue
  >(t, true);
  const containerStyle = commonFormStyles['responsive-flex-box-columns-rows'];
  const headingStyle = commonFormStyles['label-size'];
  const boxStyle = commonFormStyles['flex-box-columns'];

  const actionChecker: ActionHandler = async (action, newValue) => {
    if (action === 'save') {
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
          <div className={boxStyle}>
            <h3 className={commonFormStyles['label-size']}>
              {t('profileForm.email')}
            </h3>
            <Form>
              <FocusKeeper targetId={`${dataType}-email`}>
                <div
                  className={classNames(
                    containerStyle,
                    commonFormStyles['editor-form-fields']
                  )}
                >
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
                  />
                  <AccessibilityFieldHelpers dataType={dataType} />
                  <AccessibleFormikErrors
                    formikProps={formikProps}
                    dataType={dataType}
                  />
                </div>
                <EditingNotifications
                  content={content}
                  dataType={dataType}
                  noSpacing
                />
                <FormButtons
                  handler={actionChecker}
                  disabled={!!saving}
                  testId={dataType}
                />
                <SaveIndicator
                  action={saveTypeToAction(saving)}
                  testId={dataType}
                />
              </FocusKeeper>
            </Form>
          </div>
        )}
      </Formik>
    );
  }

  return (
    <div className={boxStyle}>
      <div className={classNames(containerStyle)}>
        <div
          className={classNames(
            boxStyle,
            commonFormStyles['editor-title-and-value'],
            commonFormStyles['last-item']
          )}
        >
          <h3 className={headingStyle}>{t('profileForm.email')}</h3>
          <span
            className={commonFormStyles['text-value']}
            data-testid={`${dataType}-email`}
          >
            {email || t('profileInformation.noEmail')}
          </span>
        </div>
        <div
          className={classNames(
            commonFormStyles['edit-buttons'],
            commonFormStyles['last-item']
          )}
        >
          {email ? (
            <EditButtons
              handler={actionChecker}
              actions={{
                removable: false,
                setPrimary: false,
              }}
              editButtonId={editButtonId}
              testId={dataType}
              ariaLabels={ariaLabels}
            />
          ) : (
            <AddButton editHandler={editHandler} />
          )}
        </div>
      </div>

      <EditingNotifications content={content} dataType={dataType} />

      {showVerifyEmailInfo && (
        <div className={styles['notification-wrapper']}>
          <Notification
            type={'alert'}
            label={t('profileInformation.verifyEmailTitle')}
            dataTestId={'verify-email-notification'}
          >
            {t('profileInformation.verifyEmailText')}
          </Notification>
        </div>
      )}
    </div>
  );
}

export default EmailEditor;
