import { TextInput } from 'hds-react';
import React, { useState } from 'react';
import { Field, Formik, FormikProps, Form } from 'formik';
import { useTranslation } from 'react-i18next';
import countries from 'i18n-iso-countries';
import classNames from 'classnames';

import { MyProfileQuery_myProfile_addresses_edges_node as Address } from '../../../graphql/generatedTypes';
import to from '../../../common/awaitTo';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import {
  ActionListener,
  EditData,
  EditableAddress,
  Action,
  UpdateResult,
  isNew,
} from '../../helpers/mutationEditor';
import { getFieldError, getIsInvalid } from '../../helpers/formik';
import { addressSchema } from '../../../common/schemas/schemas';
import EditButtons from './EditButtons';
import Actions from './Actions';
import FormikDropdown, {
  HdsOptionType,
} from '../../../common/formikDropdown/FormikDropdown';
import getLanguageCode from '../../../common/helpers/getLanguageCode';
import LabeledValue from '../../../common/labeledValue/LabeledValue';
import getCountry from '../../helpers/getCountry';

type FormikValues = EditableAddress;

type Props = { data: EditData; onAction: ActionListener };

function EditableRowAddress(props: Props): React.ReactElement {
  const { data, onAction } = props;
  const { profileData } = data;
  const value = data.value as EditableAddress;
  const { address, city, postalCode, countryCode } = profileData as Address;
  const isNewItem = isNew(data);
  const { t, i18n } = useTranslation();
  const lang = i18n.languages[0];
  const [isEditing, setEditing] = useState(isNewItem);
  const applicationLanguage = getLanguageCode(i18n.languages[0]);
  const countryList = countries.getNames(applicationLanguage);
  const countryOptions = Object.keys(countryList).map(key => ({
    value: key,
    label: countryList[key],
  }));

  const hasFieldError = (
    formikProps: FormikProps<FormikValues>,
    type: keyof FormikValues
  ): boolean => getIsInvalid<FormikValues>(formikProps, type, !isNewItem);

  const getFieldErrorMessage = (
    formikProps: FormikProps<FormikValues>,
    type: keyof FormikValues
  ) => getFieldError<FormikValues>(t, formikProps, type, {}, !isNewItem);

  const actionHandler = async (action: Action): Promise<UpdateResult> => {
    const promise = await onAction(action, data);
    if (action === 'cancel' && !isNewItem) {
      setEditing(false);
    }
    if (action === 'edit') {
      setEditing(true);
    }
    return promise;
  };

  const { editable, removable, primary } = data;

  if (isEditing) {
    return (
      <Formik
        initialValues={{
          address,
          city,
          postalCode,
          countryCode,
          primary: !!primary,
        }}
        onSubmit={async (values, actions) => {
          actions.setSubmitting(true);
          data.value = values;
          const [err] = await to(onAction('save', data));
          if (err) {
            actions.setSubmitting(false);
          } else if (!isNewItem) {
            actions.setSubmitting(false);
            setEditing(false);
          }
        }}
        validationSchema={addressSchema}
      >
        {(formikProps: FormikProps<FormikValues>) => (
          <Form className={commonFormStyles.multiItemForm}>
            <h3 className={commonFormStyles.sectionTitle}>
              {primary
                ? t('profileInformation.primaryAddress')
                : t('profileInformation.address')}
            </h3>
            <div className={commonFormStyles.multiItemWrapper}>
              <Field
                name="address"
                id="address"
                maxLength="255"
                as={TextInput}
                invalid={hasFieldError(formikProps, 'address')}
                helperText={getFieldErrorMessage(formikProps, 'address')}
                labelText={t('profileForm.address')}
                autoFocus
              />
              <Field
                name="postalCode"
                id="postalCode"
                maxLength="5"
                as={TextInput}
                invalid={hasFieldError(formikProps, 'postalCode')}
                helperText={getFieldErrorMessage(formikProps, 'postalCode')}
                labelText={t('profileForm.postalCode')}
              />
              <Field
                name="city"
                id="city"
                maxLength="255"
                as={TextInput}
                invalid={hasFieldError(formikProps, 'city')}
                helperText={getFieldErrorMessage(formikProps, 'city')}
                labelText={t('profileForm.city')}
              />
              <FormikDropdown
                className={commonFormStyles.formField}
                name="countryCode"
                id="countryCode"
                options={countryOptions}
                label={t('profileForm.country')}
                default={countryCode}
                onChange={option =>
                  formikProps.setFieldValue(
                    'countryCode',
                    (option as HdsOptionType).value
                  )
                }
              />
            </div>
            <EditButtons
              handler={actionHandler}
              canSubmit={!!editable && !Boolean(formikProps.isSubmitting)}
              alignLeft
            />
          </Form>
        )}
      </Formik>
    );
  }
  return (
    <div
      className={classNames([
        commonFormStyles.contentWrapper,
        commonFormStyles.multiItemContentWrapper,
      ])}
    >
      <h3 className={commonFormStyles.sectionTitle}>
        {primary
          ? t('profileInformation.primaryAddress')
          : t('profileInformation.address')}
      </h3>
      <div className={commonFormStyles.multiItemWrapper}>
        <LabeledValue label={t('profileForm.address')} value={value.address} />
        <LabeledValue
          label={t('profileForm.postalCode')}
          value={value.postalCode}
        />
        <LabeledValue label={t('profileForm.city')} value={value.city} />
        <LabeledValue
          label={t('profileForm.country')}
          value={getCountry(value.countryCode, lang)}
        />
      </div>
      <div className={commonFormStyles.actionsWrapper}>
        <Actions
          handler={actionHandler}
          actions={{
            editable,
            removable: removable && !primary,
            primary,
            setPrimary: true,
          }}
          buttonClassNames={commonFormStyles.actionsWrapperButton}
        />
      </div>
    </div>
  );
}

export default EditableRowAddress;
