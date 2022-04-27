import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Select, SingleSelectProps, Combobox } from 'hds-react';
import { Field } from 'formik';
import { useTranslation } from 'react-i18next';

type Props = {
  name: string;
  defaultOption: OptionType;
  initialOption?: OptionType;
  currentOption?: OptionType;
  toggleButtonAriaLabel?: string;
  allowSearch?: boolean;
  virtualized?: boolean;
} & Omit<SingleSelectProps<OptionType>, 'defaultOption' | 'value'>;

export type OptionType = {
  value: string;
  label: string;
};

function FormikDropdown(props: Props): React.ReactElement {
  const { t, i18n } = useTranslation();
  const {
    defaultOption,
    initialOption,
    currentOption,
    allowSearch,
    toggleButtonAriaLabel,
    onChange: onChangeCallback,
    virtualized,
    ...singleSelectProps
  } = props;

  const lastCheckedLanguage = useRef<string>(i18n.language);

  const findOptionByValue = useCallback(
    (value?: string): OptionType | undefined => {
      if (!value) {
        return undefined;
      }
      return singleSelectProps.options.find(
        (option: OptionType) => option.value === value
      );
    },
    [singleSelectProps.options]
  );

  const [selectedOption, setSelectedOption] = useState<OptionType | undefined>(
    currentOption || initialOption || defaultOption
  );

  useEffect(() => {
    if (currentOption) {
      return;
    }
    if (lastCheckedLanguage.current === i18n.language) {
      return;
    }
    const selectedInCurrentOptions = findOptionByValue(selectedOption?.value);
    if (
      selectedOption &&
      selectedInCurrentOptions &&
      selectedInCurrentOptions.label !== selectedOption.label
    ) {
      setSelectedOption(selectedInCurrentOptions);
    }
    lastCheckedLanguage.current = i18n.language;
  }, [i18n.language, selectedOption, findOptionByValue, currentOption]);

  const commonProps: SingleSelectProps<OptionType> = {
    ...singleSelectProps,
    multiselect: false,
    value: currentOption || selectedOption,
    // eslint-disable-next-line no-undef
    virtualized: process.env.NODE_ENV !== 'test' && virtualized,
    getA11yStatusMessage: selectionProps =>
      selectionProps.selectedItem
        ? t('profileInformation.ariaSelectedOption', {
            value: selectionProps.selectedItem.label,
          })
        : t('profileInformation.ariaNoSelectedItemForLabel', {
            label: singleSelectProps.label,
          }),
    onChange: value => {
      if (onChangeCallback) {
        onChangeCallback(value);
      }
      setSelectedOption(value);
    },
  };
  if (allowSearch && !toggleButtonAriaLabel) {
    throw new Error('Combobox requires toggleButtonAriaLabel');
  }
  if (currentOption && allowSearch) {
    throw new Error(
      'Cannot enable allowSearch and use search input when option is locked from outside via currentOption'
    );
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
