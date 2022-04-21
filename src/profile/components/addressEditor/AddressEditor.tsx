import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Field, Formik, FormikProps, Form } from 'formik';
import { Button, IconPlusCircle, TextInput } from 'hds-react';
import to from 'await-to-js';
import _ from 'lodash';
import countries from 'i18n-iso-countries';

import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import ProfileSection from '../../../common/profileSection/ProfileSection';
import { getFormFields } from '../../helpers/formProperties';
import {
  AddressValue,
  EditDataType,
  EditDataValue,
  getAddressEditDataForUI,
  isNewItem,
} from '../../helpers/editData';
import {
  saveTypeToAction,
  useProfileDataEditor,
} from '../../hooks/useProfileDataEditor';
import { addressSchema } from '../../../common/schemas/schemas';
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
import getLanguageCode from '../../../common/helpers/getLanguageCode';
import FormikDropdown, {
  OptionType,
} from '../../../common/formikDropdown/FormikDropdown';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import getCountry from '../../helpers/getCountry';
import { useConfirmationModal } from '../../hooks/useConfirmationModal';
import ConfirmationModal from '../modals/confirmationModal/ConfirmationModal';

function AddressEditor(): React.ReactElement | null {
  const dataType: EditDataType = 'addresses';
  const [isEditing, setEditing] = useState(false);
  const { t, i18n } = useTranslation();
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
  const [removeButtonId, setFocusToRemoveButton] = useFocusSetter({
    targetId: `${dataType}-remove-button`,
  });
  const [addButtonId, setFocusToAddButton] = useFocusSetter({
    targetId: `${dataType}-add-button`,
  });
  const { showModal, modalProps } = useConfirmationModal();

  const editData = getAddressEditDataForUI(editDataList);
  const { value, saving } = editData;
  const { address, city, postalCode, countryCode } = value as AddressValue;

  const formFields = getFormFields(dataType);
  const ariaLabels = createActionAriaLabels(dataType, address, t);
  const formFieldStyle = commonFormStyles['form-field'];
  const lang = i18n.languages[0];
  const applicationLanguage = getLanguageCode(i18n.languages[0]);

  const countryList = countries.getNames(applicationLanguage);
  const countryOptions = Object.keys(countryList)
    .map(key => ({
      value: key,
      label: countryList[key],
    }))
    .sort((a, b) => {
      if (a.label < b.label) {
        return -1;
      }
      if (a.label > b.label) {
        return 1;
      }
      return 0;
    });
  const defaultCountryOption = countryOptions[0];
  const initialCountryOption = countryOptions.find(
    option => option.value === countryCode
  ) as OptionType;

  const { hasFieldError, getFieldErrorMessage } = createFormFieldHelpers<
    AddressValue
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
      }
    } else if (action === 'cancel') {
      if (isNewItem(editData)) {
        await remove(editData);
        setFocusToAddButton();
      } else {
        reset(editData);
        setFocusToEditButton();
      }
      setEditing(false);
    } else if (action === 'edit') {
      setEditing(true);
    } else if (action === 'remove') {
      const [rejected] = await to(
        showModal({
          actionButtonText: t('confirmationModal.remove'),
          title: t('confirmationModal.removeAddress'),
        })
      );
      if (rejected) {
        setFocusToRemoveButton();
      } else {
        const [error] = await to(remove(editData));
        if (error) {
          setErrorMessage('remove');
        } else {
          setSuccessMessage('remove');
          setEditing(false);
        }
      }
    }
    return Promise.resolve();
  };

  const SectionTitle = (): React.ReactElement => (
    <h2 className={commonFormStyles['section-title']}>
      {t('profileInformation.address')}
    </h2>
  );

  const Content = ({
    children,
  }: {
    children: React.ReactElement | React.ReactNodeArray;
  }): React.ReactElement => (
    <div className={commonFormStyles['content-wrapper']}>{children}</div>
  );

  if (isEditing) {
    return (
      <Formik
        initialValues={{
          address,
          city,
          postalCode,
          countryCode,
        }}
        onSubmit={async values => actionHandler('save', values)}
        validationSchema={addressSchema}
      >
        {(formikProps: FormikProps<AddressValue>) => (
          <ProfileSection>
            <SectionTitle />
            <Content>
              <Form>
                <FocusKeeper targetId={`${dataType}-address`}>
                  <div className={commonFormStyles['multi-item-wrapper']}>
                    <Field
                      name="address"
                      id={`${dataType}-address`}
                      maxLength={formFields.address.max as number}
                      as={TextInput}
                      invalid={hasFieldError(formikProps, 'address')}
                      aria-invalid={hasFieldError(formikProps, 'address')}
                      errorText={getFieldErrorMessage(formikProps, 'address')}
                      label={`${t(formFields.address.translationKey)} *`}
                      autoFocus
                      aria-labelledby={`${dataType}-address-helper`}
                      className={formFieldStyle}
                    />
                    <Field
                      name="postalCode"
                      id={`${dataType}-postalCode`}
                      maxLength={formFields.postalCode.max as number}
                      as={TextInput}
                      invalid={hasFieldError(formikProps, 'postalCode')}
                      aria-invalid={hasFieldError(formikProps, 'postalCode')}
                      errorText={getFieldErrorMessage(
                        formikProps,
                        'postalCode'
                      )}
                      label={`${t(formFields.postalCode.translationKey)} *`}
                      aria-labelledby={`${dataType}-postalCode-helper`}
                      className={formFieldStyle}
                    />
                    <Field
                      name="city"
                      id={`${dataType}-city`}
                      maxLength={formFields.city.max as number}
                      as={TextInput}
                      invalid={hasFieldError(formikProps, 'city')}
                      aria-invalid={hasFieldError(formikProps, 'city')}
                      errorText={getFieldErrorMessage(formikProps, 'city')}
                      label={`${t(formFields.city.translationKey)} *`}
                      aria-labelledby={`${dataType}-city-helper`}
                      className={formFieldStyle}
                    />
                    <div className={commonFormStyles['form-field']}>
                      <FormikDropdown
                        name="countryCode"
                        id={`${dataType}-countryCode`}
                        options={countryOptions}
                        label={`${t(formFields.countryCode.translationKey)} *`}
                        defaultOption={defaultCountryOption}
                        invalid={hasFieldError(formikProps, 'countryCode')}
                        error={getFieldErrorMessage(formikProps, 'countryCode')}
                        aria-describedby={`${dataType}-countryCode-helper`}
                        toggleButtonAriaLabel={t(
                          'profileInformation.ariaShowOptions'
                        )}
                        allowSearch
                        onChange={option =>
                          formikProps.setFieldValue(
                            'countryCode',
                            option ? option.value : ''
                          )
                        }
                        initialOption={initialCountryOption}
                      />
                    </div>
                  </div>
                  <AccessibilityFieldHelpers dataType={dataType} />
                  <AccessibleFormikErrors
                    formikProps={formikProps}
                    dataType={dataType}
                  />
                  <EditingNotifications content={content} dataType={dataType} />
                  <FormButtons
                    handler={actionHandler}
                    disabled={!!saving}
                    alignLeft
                    testId={dataType}
                  />

                  <SaveIndicator
                    action={saveTypeToAction(saving)}
                    testId={dataType}
                  />
                </FocusKeeper>
              </Form>
            </Content>
          </ProfileSection>
        )}
      </Formik>
    );
  }
  if (isNewItem(editData)) {
    return (
      <ProfileSection>
        <Content>
          <SectionTitle />
          <div
            className={commonFormStyles['text-content-wrapper']}
            data-testid={`${dataType}-no-data`}
          >
            {t('profileInformation.noAddresses')}
          </div>
          <EditingNotifications content={content} dataType={dataType} />
          <Button
            iconLeft={<IconPlusCircle />}
            onClick={async () => {
              clearMessage();
              add();
              setEditing(true);
            }}
            id={addButtonId}
            variant="secondary"
            className={commonFormStyles['responsive-button']}
          >
            {t('profileForm.addAnotherAddress')}
          </Button>
        </Content>
      </ProfileSection>
    );
  }
  return (
    <ProfileSection>
      <Content>
        <SectionTitle />
        <div className={commonFormStyles['multi-item-wrapper']}>
          <LabeledValue
            label={t(formFields.address.translationKey)}
            value={address}
            testId={`${dataType}-address`}
          />
          <LabeledValue
            label={t(formFields.postalCode.translationKey)}
            value={postalCode}
            testId={`${dataType}-postalCode`}
          />
          <LabeledValue
            label={t(formFields.city.translationKey)}
            value={city}
            testId={`${dataType}-city`}
          />
          <LabeledValue
            label={t(formFields.countryCode.translationKey)}
            value={getCountry(countryCode, lang)}
            testId={`${dataType}-countryCode`}
          />
        </div>
        <div className={commonFormStyles['actions-wrapper']}>
          <EditButtons
            handler={actionHandler}
            actions={{
              removable: true,
              setPrimary: false,
            }}
            buttonClassNames={commonFormStyles['actions-wrapper-button']}
            editButtonId={editButtonId}
            removeButtonId={removeButtonId}
            testId={dataType}
            ariaLabels={ariaLabels}
          />
        </div>
      </Content>
      <EditingNotifications content={content} dataType={dataType} />
      <ConfirmationModal {...modalProps} />
    </ProfileSection>
  );
}

export default AddressEditor;
