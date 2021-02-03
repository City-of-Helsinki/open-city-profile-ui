import { Button, IconPlusCircle, IconMinusCircle, TextInput } from 'hds-react';
import React, { useState } from 'react';
import { Field, FormikProps, FieldArray } from 'formik';
import countries from 'i18n-iso-countries';
import { useTranslation } from 'react-i18next';

import styles from './editableAddressForm.module.css';
import commonFormStyles from '../../../common/cssHelpers/form.module.css';
import {
  EditableBasicData,
  EditableAddress,
  createEditableData,
} from '../../helpers/mutationEditor';
import { getFieldError, getIsInvalid } from '../../helpers/formik';
import FormikDropdown, {
  HdsOptionType,
} from '../../../common/formikDropdown/FormikDropdown';
import getLanguageCode from '../../../common/helpers/getLanguageCode';

type FormikValues = EditableBasicData;

type Props = { formikProps: FormikProps<FormikValues> };

function EditableAddressForm(props: Props): React.ReactElement {
  const { formikProps } = props;
  const { t, i18n } = useTranslation();
  const [newAddressIndex, setNewAddressIndex] = useState(-1);
  const applicationLanguage = getLanguageCode(i18n.languages[0]);
  const countryList = countries.getNames(applicationLanguage);
  const countryOptions = Object.keys(countryList).map(key => ({
    value: key,
    label: countryList[key],
  }));

  const addAddress = () => {
    const newAddress = createEditableData('addresses') as EditableAddress;
    const previous = formikProps.getFieldProps('addresses').value;
    setNewAddressIndex(previous.length);
    previous.push(newAddress);
    formikProps.setFieldValue('addresses', previous);
  };

  const removeAddress = (index: number) => {
    const previous = formikProps.getFieldProps('addresses').value;
    if (index < newAddressIndex) {
      setNewAddressIndex(newAddressIndex - 1);
    } else if (index === newAddressIndex) {
      setNewAddressIndex(-1);
    }
    previous.splice(index, 1);
    formikProps.setFieldValue('addresses', previous);
  };

  const invalidChecker = (fieldName: string, index: number) => {
    const isOldData = index !== newAddressIndex;
    return getIsInvalid<FormikValues>(formikProps, fieldName, isOldData);
  };

  const getErrorMessage = (
    fieldName: string,
    index: number,
    options?: Record<string, unknown>
  ) => {
    const isOldData = index !== newAddressIndex;
    return getFieldError<FormikValues>(
      t,
      formikProps,
      fieldName,
      options,
      isOldData
    );
  };

  return (
    <React.Fragment>
      <FieldArray
        name="addresses"
        render={() => (
          <React.Fragment>
            {formikProps?.values?.addresses.map(
              (address: EditableAddress, index: number) => (
                <div
                  className={commonFormStyles.addressFormFieldGroup}
                  key={index}
                >
                  <h3 className={commonFormStyles.sectionTitle}>
                    {index === 0 ? 'Vakinainen osoite' : 'Muu osoite'}
                  </h3>
                  <div className={commonFormStyles.formFields}>
                    <Field
                      className={commonFormStyles.formField}
                      as={TextInput}
                      maxLength="128"
                      name={`addresses.${index}.address`}
                      id={`addresses.${index}.address`}
                      labelText={t('profileForm.address')}
                      invalid={invalidChecker(
                        `addresses.${index}.address`,
                        index
                      )}
                      helperText={getErrorMessage(
                        `addresses.${index}.address`,
                        index,
                        {
                          max: 128,
                        }
                      )}
                    />

                    <Field
                      className={commonFormStyles.formField}
                      maxLength="5"
                      as={TextInput}
                      name={`addresses.${index}.postalCode`}
                      id={`addresses.${index}.postalCode`}
                      labelText={t('profileForm.postalCode')}
                      invalid={invalidChecker(
                        `addresses.${index}.postalCode`,
                        index
                      )}
                      helperText={getErrorMessage(
                        `addresses.${index}.postalCode`,
                        index,
                        {
                          max: 5,
                        }
                      )}
                    />

                    <Field
                      className={commonFormStyles.formField}
                      as={TextInput}
                      maxLength="64"
                      name={`addresses.${index}.city`}
                      id={`addresses.${index}.city`}
                      labelText={t('profileForm.city')}
                      invalid={invalidChecker(`addresses.${index}.city`, index)}
                      helperText={getErrorMessage(
                        `addresses.${index}.city`,
                        index,
                        {
                          max: 64,
                        }
                      )}
                    />

                    <FormikDropdown
                      className={commonFormStyles.formField}
                      name={`addresses.${index}.countryCode`}
                      id={`addresses.${index}.countryCode`}
                      options={countryOptions}
                      label={t('profileForm.country')}
                      default={formikProps.values.addresses[index].countryCode}
                      onChange={option =>
                        formikProps.setFieldValue(
                          `addresses.${index}.countryCode` as 'addresses',
                          (option as HdsOptionType).value
                        )
                      }
                    />
                  </div>
                  <div className={styles.addressFormActions}>
                    <Button
                      iconLeft={<IconMinusCircle />}
                      variant="supplementary"
                      type="button"
                      disabled={index === 0}
                      onClick={() => removeAddress(index)}
                    >
                      {t('remove')}
                    </Button>
                  </div>
                </div>
              )
            )}
          </React.Fragment>
        )}
      />
      <div>
        <Button
          iconLeft={<IconPlusCircle />}
          variant="supplementary"
          type="button"
          disabled={newAddressIndex > -1}
          onClick={() => addAddress()}
        >
          {t('profileForm.addAnotherAddress')}
        </Button>
      </div>
    </React.Fragment>
  );
}

export default EditableAddressForm;
