import { Button, IconPenLine, TextInput } from 'hds-react';
import React, { useState } from 'react';
import { Field, Formik, FormikProps, Form } from 'formik';
import { useTranslation } from 'react-i18next';
import { useMatomo } from '@datapunt/matomo-tracker-react';

import to from '../../../common/awaitTo';
import { useProfileMutationHandler } from '../../helpers/hooks';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import {
  ActionListener,
  EditableBasicData as EditableBasicDataType,
  basicDataType,
  resetBasicData,
} from '../../helpers/mutationEditor';
import { getFieldError, getIsInvalid } from '../../helpers/formik';
import EditableAddressForm from '../editableAddressForm/EditableAddressForm';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import useNotificationContent from '../editingNotifications/useNotificationContent';
import EditingNotifications from '../editingNotifications/EditingNotifications';
import { basicDataSchema } from '../../../common/schemas/schemas';

type FormikValues = EditableBasicDataType;

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

  if (!data || !data[0]) {
    return null;
  }
  const editData = data[0];
  const { value, editable } = editData;
  const {
    firstName,
    nickname,
    lastName,
    addresses,
  } = value as EditableBasicDataType;

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

  if (isEditing) {
    return (
      <Formik
        initialValues={{ firstName, nickname, lastName, addresses }}
        onSubmit={async (values, actions) => {
          actions.setSubmitting(true);
          // eslint-disable-next-line no-shadow
          const { firstName, nickname, lastName, addresses } = values;
          editData.value = { firstName, nickname, lastName, addresses };
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
          <ProfileSection title={''}>
            <Form>
              <div className={commonFormStyles.formFields}>
                <h3 className={commonFormStyles.sectionTitle}>Perustiedot</h3>
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
              <div className={commonFormStyles.addressFormFields}>
                <EditableAddressForm formikProps={formikProps} />
              </div>
              <EditingNotifications content={content} />
              <div className={commonFormStyles.editActions}>
                <Button
                  type="submit"
                  disabled={Boolean(formikProps.isSubmitting)}
                >
                  Tallenna
                </Button>
                <Button
                  disabled={Boolean(formikProps.isSubmitting)}
                  variant="secondary"
                  onClick={() => {
                    onAction('cancel', editData);
                    setEditing(false);
                  }}
                >
                  Peruuta
                </Button>
              </div>
            </Form>
          </ProfileSection>
        )}
      </Formik>
    );
  }
  return (
    <ProfileSection
      title={''}
      titleButton={
        editable && (
          <Button
            variant="supplementary"
            iconLeft={<IconPenLine />}
            onClick={() => {
              onAction('edit', editData);
              clearMessage();
              setEditing(true);
            }}
          >
            {t('profileForm.edit')}
          </Button>
        )
      }
    >
      <h3 className={commonFormStyles.sectionTitle}>Perustiedot</h3>
      <div className={commonFormStyles.storedInformation}>
        <LabeledValue label={t('profileForm.firstName')} value={firstName} />
        <LabeledValue label={t('profileForm.nickname')} value={nickname} />
        <LabeledValue label={t('profileForm.lastName')} value={lastName} />
      </div>
      {addresses.map((address, index) => (
        <React.Fragment key={address.address}>
          <h3 className={commonFormStyles.sectionTitle}>
            {address.primary
              ? t('profileInformation.primaryAddress')
              : `${t('profileInformation.address')} ${index + 1}`}
          </h3>
          <div className={commonFormStyles.storedInformation}>
            <LabeledValue
              label={t('profileForm.address')}
              value={address.address}
            />
            <LabeledValue
              label={t('profileForm.postalCode')}
              value={address.postalCode}
            />
            <LabeledValue label={t('profileForm.city')} value={address.city} />
            <LabeledValue
              label={t('profileForm.country')}
              value={address.countryCode}
            />
          </div>
        </React.Fragment>
      ))}
      <EditingNotifications content={content} />
    </ProfileSection>
  );
}

export default EditableBasicData;
