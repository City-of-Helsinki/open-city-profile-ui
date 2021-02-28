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
  resetBasicData,
  Action,
  UpdateResult,
} from '../../helpers/mutationEditor';
import { getFieldError, getIsInvalid } from '../../helpers/formik';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import useNotificationContent from '../editingNotifications/useNotificationContent';
import EditingNotifications from '../editingNotifications/EditingNotifications';
import { basicDataSchema } from '../../../common/schemas/schemas';
import Actions from '../editableRow/Actions';
import EditButtons from '../editableRow/EditButtons';

type FormikValues = EditableUserData;

function EditableBasicData(): React.ReactElement | null {
  const { data, add, save } = useProfileMutationHandler({
    dataType: basicDataType,
  });
  const {
    content,
    setErrorMessage,
    setSuccessMessage,
    clearMessage,
  } = useNotificationContent();
  const [isEditing, setEditing] = useState(false);
  const { t } = useTranslation();
  const { trackEvent } = useMatomo();

  if (!data || !data[0]) {
    return null;
  }
  const editData = data[0];
  const { value, editable } = editData;
  const { firstName, nickname, lastName } = value as EditableUserData;

  const onAction: ActionListener = async (action, item) => {
    trackEvent({ category: 'form-action', action });
    clearMessage();
    if (action === 'add') {
      add();
    }
    if (action === 'cancel') {
      resetBasicData(data);
    }
    if (action === 'save') {
      return save(item);
    }
    return Promise.resolve();
  };

  const actionHandler = async (action: Action): Promise<UpdateResult> => {
    const promise = await onAction(action, editData);
    if (action === 'cancel') {
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
    fieldName: keyof FormikValues,
    options?: Record<string, unknown>
  ) => {
    if (!hasFieldError(formikProps, fieldName)) {
      return undefined;
    }
    return getFieldError<FormikValues>(
      t,
      formikProps,
      fieldName,
      options,
      true
    );
  };

  /*
  const setPrimaryAddress = async (index: number) => {
    const addressList = (editData.profileData as BasicData).addresses;
    const item = addressList[index];
    if (!item || !item.id || item.primary) {
      // + show error
      return Promise.resolve();
    }
    await setPrimary(createEditItem('addresses', item));
    return Promise.resolve();
  };*/

  if (isEditing) {
    return (
      <Formik
        initialValues={{ firstName, nickname, lastName }}
        enableReinitialize
        onSubmit={async (values, actions) => {
          actions.setSubmitting(true);
          // eslint-disable-next-line no-shadow
          const { firstName, nickname, lastName } = values;
          editData.value = { firstName, nickname, lastName };
          const [error] = await to(onAction('save', editData));
          actions.setSubmitting(false);
          if (error) {
            setErrorMessage('', 'save');
          } else {
            setSuccessMessage('', 'save');
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
                  id="firstName"
                  maxLength="255"
                  as={TextInput}
                  invalid={hasFieldError(formikProps, 'firstName')}
                  helperText={getFieldErrorMessage(formikProps, 'firstName')}
                  labelText={t('profileForm.firstName')}
                />
                <Field
                  className={commonFormStyles.formField}
                  name="nickname"
                  id="nickname"
                  maxLength="255"
                  as={TextInput}
                  invalid={hasFieldError(formikProps, 'nickname')}
                  helperText={getFieldErrorMessage(formikProps, 'nickname')}
                  labelText={t('profileForm.nickname')}
                />
                <Field
                  className={commonFormStyles.formField}
                  name="lastName"
                  id="lastName"
                  maxLength="255"
                  as={TextInput}
                  invalid={hasFieldError(formikProps, 'lastName')}
                  helperText={getFieldErrorMessage(formikProps, 'lastName')}
                  labelText={t('profileForm.lastName')}
                />
              </div>
              <EditingNotifications content={content} />
              <EditButtons
                handler={actionHandler}
                canSubmit={!!editable && !Boolean(formikProps.isSubmitting)}
                alignLeft
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
          <LabeledValue label={t('profileForm.firstName')} value={firstName} />
          <LabeledValue label={t('profileForm.nickname')} value={nickname} />
          <LabeledValue label={t('profileForm.lastName')} value={lastName} />
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
          />
        </div>
      </div>
      <EditingNotifications content={content} />
    </ProfileSection>
  );
}

export default EditableBasicData;
