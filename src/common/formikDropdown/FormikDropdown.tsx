import React from 'react';
import { Select, SingleSelectProps, Combobox } from 'hds-react';
import { Field } from 'formik';
import { useTranslation } from 'react-i18next';

import { Language } from '../../graphql/typings';

type Props = {
  name: string;
  default: string | Language;
  toggleButtonAriaLabel?: string;
  allowSearch?: boolean;
} & SingleSelectProps<OptionType>;

export type OptionType = {
  value: string;
  label: string;
};

function FormikDropdown(props: Props): React.ReactElement {
  const { t } = useTranslation();

  const {
    name,
    default: defaultVal,
    allowSearch,
    toggleButtonAriaLabel,
    ...singleSelectProps
  } = props;
  const defaultValue = singleSelectProps.options.find(
    (option: OptionType) => option.value === defaultVal
  );
  const commonProps: SingleSelectProps<OptionType> = {
    ...singleSelectProps,
    defaultValue,
    multiselect: false,
    getA11yStatusMessage: selectionProps =>
      selectionProps.selectedItem
        ? t('profileInformation.ariaSelectedOption', {
            value: selectionProps.selectedItem.label,
          })
        : t('profileInformation.ariaNoSelectedItemForLabel', {
            label: singleSelectProps.label,
          }),
  };

  if (allowSearch && !toggleButtonAriaLabel) {
    throw new Error('Combobox requires toggleButtonAriaLabel');
  }
  return (
    <Field name={props.name}>
      {() =>
        allowSearch ? (
          <Combobox
            {...commonProps}
            toggleButtonAriaLabel={toggleButtonAriaLabel as string}
          />
        ) : (
          <Select {...commonProps} />
        )
      }
    </Field>
  );
}

export default FormikDropdown;
