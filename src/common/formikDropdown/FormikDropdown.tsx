import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Select,
  SelectProps,
  Option,
  Texts,
  SupportedLanguage,
} from 'hds-react';
import { Field } from 'formik';
import { useTranslation } from 'react-i18next';

export function defaultFilter(option: Option, filterStr: string) {
  return option.label.toLowerCase().indexOf(filterStr.toLowerCase()) > -1;
}

// Type guard to check if an option has a value property
function isOptionWithValue(
  option: unknown
): option is Option & { value: string } {
  return typeof option === 'object' && option !== null && 'value' in option;
}

// Define the component props using more specific generic types
type Props = {
  name: string;
  defaultOption: Option;
  initialOption?: Option;
  currentOption?: Option;
  allowSearch?: boolean;
  virtualized?: boolean;
  className?: string;
  label?: string;
  error?: string;
  onChange?: (clickedOption: Option) => void;
} & Omit<
  SelectProps<React.ReactElement>,
  'defaultValue' | 'onChange' | 'value'
>;

function FormikDropdown(props: Props): React.ReactElement {
  const { i18n } = useTranslation();
  const {
    defaultOption,
    initialOption,
    currentOption,
    allowSearch,
    onChange: onChangeCallback,
    virtualized,
    className,
    label,
    error,
    ...selectProps
  } = props;

  const lastCheckedLanguage = useRef<string>(i18n.language);

  // Find the option by value with proper typing
  const findOptionByValue = useCallback(
    (value?: string): Option | undefined => {
      if (!value || !selectProps.options) {
        return undefined;
      }

      // Search for option with matching value
      // Type assertion is needed because HDS's options could be a mix of types
      const foundOption = selectProps.options.find(
        (option) => isOptionWithValue(option) && option.value === value
      );

      return foundOption as Option | undefined;
    },
    [selectProps.options]
  );

  const [selectedOption, setSelectedOption] = useState<Option | undefined>(
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

  const handleChange = useCallback(
    (selectedOptions: Option[], clickedOption: Option | null) => {
      // Use the clicked option directly
      if (onChangeCallback && clickedOption) {
        onChangeCallback(clickedOption);
      }

      setSelectedOption(clickedOption || undefined);
    },
    [onChangeCallback]
  );

  // Get the current value directly from the option
  const currentValue = (currentOption || selectedOption)?.value;

  const defaultTexts: Partial<Texts> = {
    label,
    error,
    language: i18n.language as SupportedLanguage,
  };

  // Use the original HDS options array to avoid type issues
  const options = selectProps.options || [];

  // For test compatibility, create an ID that matches the test expectations
  const selectId = selectProps.id || `${props.name}-select`;

  return (
    <Field name={props.name}>
      {() => (
        <Select
          {...selectProps}
          className={className}
          clearable={false}
          id={selectId}
          options={options}
          value={currentValue}
          onChange={handleChange}
          texts={defaultTexts}
          filter={allowSearch ? defaultFilter : undefined}
          virtualize={import.meta.env.NODE_ENV !== 'test' && virtualized}
        />
      )}
    </Field>
  );
}

export default FormikDropdown;
