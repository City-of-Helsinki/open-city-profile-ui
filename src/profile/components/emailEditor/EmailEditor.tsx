import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  TextInput,
  Notification,
  NotificationSize,
  useOidcClient,
} from 'hds-react';
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
import { createFormFieldHelpers } from '../../helpers/formFields';
import EditingNotifications from '../editingNotifications/EditingNotifications';
import EditButtons, { ActionHandler } from '../editButtons/EditButtons';
import FormButtons from '../formButtons/FormButtons';
import SaveIndicator from '../saveIndicator/SaveIndicator';
import createActionAriaLabels from '../../helpers/createActionAriaLabels';
import FocusKeeper from '../../../common/focusKeeper/FocusKeeper';
import AccessibleFormErrors from '../accessibleFormErrors/AccessibleFormErrors';
import AccessibilityFieldHelpers from '../../../common/accessibilityFieldHelpers/AccessibilityFieldHelpers';
import {
  hasHelsinkiAccountAMR,
  hasTunnistusSuomiFiAmr,
  requiresStrongAuthenticationForHybrid,
} from '../profileInformation/authenticationProviderUtil';
import { useCommonEditHandling } from '../../hooks/useCommonEditHandling';
import AddButton from '../addButton/AddButton';
import { ProfileContext } from '../../context/ProfileContext';

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
  const { data } = useContext(ProfileContext);

  const editData = getEmailEditDataForUI(hasData() ? [getData()] : []);
  const { value, saving } = editData;
  const { email } = value as EmailValue;
  const formFields = getFormFields(dataType);
  const ariaLabels = createActionAriaLabels(dataType, email, t);
  const amrArray = getAmr();
  const strongAuthenticationRequired = requiresStrongAuthenticationForHybrid(
    data,
    amrArray
  );
  const willSendEmailVerificationCode =
    !strongAuthenticationRequired &&
    (hasTunnistusSuomiFiAmr(amrArray) || hasHelsinkiAccountAMR(amrArray));
  const { hasFieldError, getFieldErrorMessage } =
    createFormFieldHelpers<EmailValue>(t, true);
  const containerStyle = commonFormStyles['responsive-flex-box-columns-rows'];
  const headingStyle = commonFormStyles['label-size'];
  const boxStyle = commonFormStyles['flex-box-columns'];

  const { register, handleSubmit, formState, reset } = useForm<EmailValue>({
    defaultValues: { email },
    resolver: yupResolver(emailSchema) as unknown as Resolver<EmailValue>,
  });

  useEffect(() => {
    if (isEditing) {
      reset({ email });
    }
  }, [isEditing, email, reset]);

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
      <div className={boxStyle}>
        <h3 className={commonFormStyles['label-size']}>
          {t('profileForm.email')}
        </h3>
        <form
          onSubmit={handleSubmit(async (values) =>
            actionChecker('save', values)
          )}
        >
          <FocusKeeper targetId={`${dataType}-email`}>
            <div
              className={classNames(
                containerStyle,
                commonFormStyles['editor-form-fields']
              )}
            >
              <TextInput
                {...register('email')}
                id={`${dataType}-email`}
                maxLength={formFields.email.max}
                invalid={hasFieldError(formState, 'email')}
                aria-invalid={hasFieldError(formState, 'email')}
                errorText={getFieldErrorMessage(formState, 'email')}
                aria-labelledby={`${dataType}-email-helper`}
                autoFocus
              />
              <AccessibilityFieldHelpers dataType={dataType} />
              <AccessibleFormErrors
                formState={
                  formState as {
                    errors: Record<string, { message?: string }>;
                    submitCount: number;
                  }
                }
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
        </form>
      </div>
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
          {!strongAuthenticationRequired &&
            (email ? (
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
            ))}
        </div>
      </div>

      <EditingNotifications content={content} dataType={dataType} />

      {strongAuthenticationRequired && (
        <div className={styles['notification-wrapper']}>
          <Notification
            size={NotificationSize.Small}
            type={'error'}
            data-testid="email-strong-authentication-required"
          >
            {t('profileInformation.explanationForStrongAuthentication')}
          </Notification>
        </div>
      )}

      {showVerifyEmailInfo && (
        <div className={styles['notification-wrapper']}>
          <Notification
            type={'alert'}
            label={t('profileInformation.verifyEmailTitle')}
            data-testid={'verify-email-notification'}
          >
            {t('profileInformation.verifyEmailText')}
          </Notification>
        </div>
      )}
    </div>
  );
}

export default EmailEditor;
